# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: posts
#
#  id              :uuid             not null, primary key
#  body_html       :text             not null
#  emoji           :string
#  hidden_from_ids :uuid             default([]), not null, is an Array
#  images_ids      :uuid             default([]), not null, is an Array
#  pinned_until    :datetime
#  title           :string
#  type            :string           not null
#  visibility      :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  author_id       :uuid             not null
#  quoted_post_id  :uuid
#
# Indexes
#
#  index_posts_for_search          ((((to_tsvector('simple'::regconfig, COALESCE((emoji)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((title)::text, ''::text))) || to_tsvector('simple'::regconfig, COALESCE(body_html, ''::text))))) USING gin
#  index_posts_on_author_id        (author_id)
#  index_posts_on_hidden_from_ids  (hidden_from_ids) USING gin
#  index_posts_on_pinned_until     (pinned_until)
#  index_posts_on_quoted_post_id   (quoted_post_id)
#  index_posts_on_type             (type)
#  index_posts_on_visibility       (visibility)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#  fk_rails_...  (quoted_post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Post < ApplicationRecord
  include Noticeable
  include PgSearch::Model

  # == Constants
  NOTIFICATION_PUSH_DELAY = T.let(
    Rails.env.production? ? 1.minute : 5.seconds,
    ActiveSupport::Duration,
  )

  # == Configuration
  self.inheritance_column = nil

  # == Attributes
  enumerize :type,
            in: %i[journal_entry poem invitation question follow_up],
            predicates: true
  enumerize :visibility, in: %i[public friends chosen_family only_me]

  sig { returns(T.nilable(T::Boolean)) }
  attr_accessor :quiet

  sig { returns(T::Boolean) }
  def quiet? = !!quiet

  sig { returns(String) }
  def body_text
    fragment = Nokogiri::HTML5.fragment(body_html)
    reshape_body_fragment_for_text_rendering!(fragment)
    Html2Text.new(fragment).convert
  end

  sig { params(text: String).void }
  def body_text=(text)
    self.body_html = format_body_html(text)
  end

  sig { returns(T::Boolean) }
  def title_visible?
    journal_entry? || poem? || invitation?
  end

  sig { returns(T.nilable(String)) }
  def title_snippet
    title&.truncate(92)
  end

  sig { returns(String) }
  def body_snippet
    body_text.truncate(120)
  end

  sig { returns(String) }
  def snippet
    title = self.title || body_snippet
    [emoji, title].compact.join(" ")
  end

  sig { returns(String) }
  def reply_snippet_base
    "> " + body_text.strip.truncate(120).split("\n").join("\n> ")
  end

  def reply_snippet
    reply_snippet_base + "\n\n"
  end

  # == Search
  pg_search_scope :search,
                  against: %i[emoji title body_html],
                  using: {
                    tsearch: {
                      websearch: true,
                    },
                  }

  # == Associations
  belongs_to :author, class_name: "User"
  has_many :author_friends, through: :author, source: :friends

  belongs_to :quoted_post, class_name: "Post", optional: true
  has_many :reactions, class_name: "PostReaction", dependent: :destroy
  has_many :stickers, class_name: "PostSticker", dependent: :destroy
  has_many :reply_receipts, class_name: "PostReplyReceipt", dependent: :destroy
  has_many :views, class_name: "PostView", dependent: :destroy
  has_many :shares, class_name: "PostShare", dependent: :destroy

  sig { returns(User) }
  def author!
    author or raise ActiveRecord::RecordNotFound, "Missing author"
  end

  sig { returns(T::Boolean) }
  def quoted_post? = quoted_post_id?

  # == Attachments
  has_many_attached :images

  # == Normalizations
  strips_text :title
  removes_blank :emoji

  # == Validations
  validates :emoji, emoji: true, allow_nil: true
  validates :type, :body_html, presence: true
  validates :title, absence: true, unless: :title_visible?
  validates :quoted_post, presence: true, if: :follow_up?
  validates :quoted_post, absence: true, unless: :follow_up?
  validates :images_ids, length: { maximum: 4 }, absence: { if: :follow_up? }
  validate :validate_no_nested_quoting, if: :quoted_post?

  # == Callbacks
  after_create :create_notifications_later, if: :send_notifications?
  after_save :save_images_ids!, if: :images_changed?

  # == Scopes
  scope :visible_to_public, -> { where(visibility: :public) }
  scope :visible_to_friends, -> { where(visibility: %i[public friends]) }
  scope :visible_to_chosen_family, -> {
    where(visibility: %i[public friends chosen_family])
  }
  scope :currently_pinned, -> { where("pinned_until > NOW()") }
  scope :not_hidden_from, ->(friend) {
    friend = T.let(friend, T.any(Friend, String))
    where("NOT (? = ANY(hidden_from_ids))", friend)
  }
  scope :user_created, -> {
    joins(:author)
      .where("posts.updated_at > (users.created_at + INTERVAL '1 second')")
  }
  scope :with_images, -> { includes(:images_blobs) }
  scope :with_reactions, -> { includes(:reactions) }
  scope :with_quoted_post_and_images, -> {
    includes(quoted_post: :images_blobs)
  }

  # == Noticeable
  sig do
    override
      .params(recipient: T.nilable(T.all(ApplicationRecord, Notifiable)))
      .returns(String)
  end
  def notification_type(recipient)
    if recipient.nil?
      "UniversePost"
    else
      "Post"
    end
  end

  sig do
    override
      .params(recipient: T.nilable(T.all(ApplicationRecord, Notifiable)))
      .returns(T::Hash[String, T.untyped])
  end
  def notification_payload(recipient)
    case recipient
    when Friend
      payload = PostNotificationPayload.new(
        post: self,
        friend_access_token: recipient.access_token,
      )
      PostNotificationPayloadSerializer.one(payload)
    when nil
      payload = UniversePostNotificationPayload.new(post: self)
      UniversePostNotificationPayloadSerializer.one(payload)
    else
      raise ArgumentError, "Invalid recipient: #{recipient.inspect}"
    end
  end

  # == Methods
  sig { returns(T::Boolean) }
  def user_created?
    updated_at > (author!.created_at + 1.second)
  end

  sig { returns(T.nilable(ActiveStorage::Blob)) }
  def cover_image_blob
    if (id = images_ids.first)
      images_blobs.find(id)
    end
  end

  sig { returns(T::Array[ActiveStorage::Blob]) }
  def ordered_image_blobs
    images_blobs.find(images_ids).to_a
  end

  sig { returns(T::Array[Image]) }
  def ordered_images
    ordered_image_blobs.map { |blob| blob.becomes(Image) }
  end

  sig { returns(T::Boolean) }
  def images_changed?
    attachment_changes.include?("images")
  end

  sig { void }
  def save_images_ids!
    images_ids = images.blobs.pluck(:id)
    update_column("images_ids", images_ids) # rubocop:disable Rails/SkipsModelValidations
  end

  sig { returns(Friend::PrivateRelation) }
  def viewers
    Friend.where(id: views.select(:friend_id)).distinct
  end

  sig { returns(PostReplyReceipt::PrivateAssociationRelation) }
  def repliers
    reply_receipts.select(:friend_id).distinct
  end

  sig { returns(Friend::PrivateRelation) }
  def hidden_from
    Friend.where(id: hidden_from_ids)
  end

  # == Notifications
  sig { returns(T::Boolean) }
  def send_notifications? = user_created? && !quiet?

  sig { returns(Friend::PrivateAssociationRelation) }
  def friends_to_notify
    subscribed_type = quoted_post&.type || type
    friends = author_friends
      .subscribed_to(subscribed_type)
      .where.not(id: hidden_from_ids)
    if visibility == :chosen_family
      friends = friends.chosen_family
    end
    friends
  end

  sig { void }
  def create_notifications!
    return if visibility == :only_me

    friends_to_notify.select(:id).find_each do |friend|
      notifications.create!(
        recipient: friend,
        push_delay: NOTIFICATION_PUSH_DELAY,
      )
    end
    if visibility == :public
      notifications.create!(recipient: nil, push_delay: NOTIFICATION_PUSH_DELAY)
    end
  end

  sig { void }
  def create_notifications_later
    CreatePostNotificationsJob.perform_later(self)
  end

  sig { returns(Friend::PrivateRelation) }
  def notified_friends
    delivered_notifications = notifications.delivered.to_friends
    Friend.where(id: delivered_notifications.select(:recipient_id)).distinct
  end

  sig { returns(Integer) }
  def push_missing_notifications_to_unseen_friends
    redelivered_notifications_count = 0
    notifications
      .undelivered
      .where(owner_type: "Friend")
      .where.not(owner_id: views.select(:friend_id))
      .find_each do |notification|
        notification.push
        redelivered_notifications_count += 1
      end
    redelivered_notifications_count
  end

  private

  # == Helpers
  sig { params(text: String).returns(String) }
  def format_body_html(text)
    BodyFormatter.text_to_html(text)
  end

  sig { overridable.params(fragment: Nokogiri::HTML5::DocumentFragment).void }
  def reshape_body_fragment_for_text_rendering!(fragment)
    fragment.css("li").each do |li|
      child = li.first_element_child
      child.replace(child.children) if child.name == "p"
    end
  end

  # == Validators
  sig { void }
  def validate_no_nested_quoting
    if (quoted_post = self.quoted_post) && quoted_post.quoted_post?
      errors.add(
        :quoted_post,
        :invalid,
        message: "cannot also contain a quoted post",
      )
    end
  end
end
