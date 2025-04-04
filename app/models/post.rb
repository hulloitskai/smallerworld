# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: posts
#
#  id             :uuid             not null, primary key
#  body_html      :text             not null
#  emoji          :string           not null
#  pinned_until   :datetime
#  title          :string
#  type           :string           not null
#  visibility     :string           not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  author_id      :uuid             not null
#  quoted_post_id :uuid
#
# Indexes
#
#  index_posts_on_author_id       (author_id)
#  index_posts_on_pinned_until    (pinned_until)
#  index_posts_on_quoted_post_id  (quoted_post_id)
#  index_posts_on_type            (type)
#  index_posts_on_visibility      (visibility)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#  fk_rails_...  (quoted_post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Post < ApplicationRecord
  include Noticeable

  self.inheritance_column = nil

  # == Attributes
  enumerize :type,
            in: %i[journal_entry poem invitation question follow_up],
            predicates: true
  enumerize :visibility, in: %i[public friends chosen_family only_me]

  sig { returns(String) }
  def body_text
    content = Nokogiri::HTML5.fragment(body_html)
    reshape_content_for_text_rendering(content)
    Html2Text.new(content).convert
  end

  sig { returns(T.nilable(String)) }
  def title_snippet
    title&.truncate(34)
  end

  sig { returns(String) }
  def body_snippet
    body_text.truncate(80)
  end

  sig { returns(String) }
  def snippet
    title = self.title || body_snippet
    [emoji, title].compact.join(" ")
  end

  sig { returns(String) }
  def reply_snippet
    "> " + body_text.truncate(80).split("\n").join("\n> ") + "\n\n"
  end

  # == Associations
  belongs_to :author, class_name: "User"
  belongs_to :quoted_post, class_name: "Post", optional: true
  has_many :reactions, class_name: "PostReaction", dependent: :destroy
  has_many :reply_receipts, class_name: "PostReplyReceipt", dependent: :destroy

  sig { returns(User) }
  def author!
    author or raise ActiveRecord::RecordNotFound, "Missing author"
  end

  sig { returns(T::Boolean) }
  def quoted_post? = quoted_post_id?

  # == Attachments
  has_one_attached :image

  # == Normalizations
  normalizes :title, with: ->(title) { title&.strip }

  # == Validations
  validates :type, :body_html, presence: true
  validates :title, absence: true, unless: :title_visible?
  validates :quoted_post, presence: true, if: :follow_up?
  validates :quoted_post, absence: true, unless: :follow_up?
  validates :image_blob, absence: true, if: :follow_up?
  validate :validate_no_nested_quoting, if: :quoted_post?

  # == Callbacks
  after_create :create_notifications_later

  # == Scopes
  scope :visible_to_public, -> { where(visibility: :public) }
  scope :visible_to_friends, -> { where(visibility: %i[public friends]) }
  scope :visible_to_chosen_family, -> {
    where(visibility: %i[public friends chosen_family])
  }
  scope :currently_pinned, -> { where("pinned_until > NOW()") }

  # == Noticeable
  sig do
    override
      .params(recipient: T.all(ActiveRecord::Base, Notifiable))
      .returns(T::Hash[String, T.untyped])
  end
  def notification_payload(recipient)
    unless recipient.is_a?(Friend)
      raise ArgumentError, "Post notification should be received by a Friend"
    end

    payload = PostNotificationPayload.new(
      post: self,
      friend_access_token: recipient.access_token,
    )
    PostNotificationPayloadSerializer.one(payload)
  end

  # == Methods
  sig { returns(Friend::PrivateRelation) }
  def audience
    friends = Friend.where(user_id: author_id)
    if visibility == :chosen_family
      friends.chosen_family
    else
      friends
    end
  end

  sig { void }
  def create_notifications!
    return if visibility == :only_me

    subscribed_type = quoted_post&.type || type
    transaction do
      friends_to_notify = audience.subscribed_to(subscribed_type)
      friends_to_notify.select(:id).find_each do |friend|
        notifications.create!(recipient: friend, push_delay: 1.minute)
      end
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

  sig { returns(PostReplyReceipt::PrivateAssociationRelation) }
  def repliers
    reply_receipts.select(:friend_id).distinct
  end

  private

  # == Helpers
  sig { overridable.params(content: Nokogiri::HTML5::DocumentFragment).void }
  def reshape_content_for_text_rendering(content)
    content.css("li").each do |li|
      child = li.first_element_child
      child.replace(child.children) if child.name == "p"
    end
  end

  sig { returns(T::Boolean) }
  def title_visible?
    journal_entry? || poem? || invitation?
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
