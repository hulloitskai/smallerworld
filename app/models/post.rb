# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: posts
#
#  id               :uuid             not null, primary key
#  body_html        :text             not null
#  emoji            :string
#  hidden_from_ids  :uuid             default([]), not null, is an Array
#  images_ids       :uuid             default([]), not null, is an Array
#  pinned_until     :datetime
#  title            :string
#  type             :string           not null
#  visibility       :string           not null
#  visible_to_ids   :uuid             default([]), not null, is an Array
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  author_id        :uuid             not null
#  encouragement_id :uuid
#  quoted_post_id   :uuid
#  space_id         :uuid
#  spotify_track_id :string
#  world_id         :uuid
#
# Indexes
#
#  index_posts_for_search                   ((((to_tsvector('simple'::regconfig, COALESCE((emoji)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((title)::text, ''::text))) || to_tsvector('simple'::regconfig, COALESCE(body_html, ''::text))))) USING gin
#  index_posts_on_author_id                 (author_id)
#  index_posts_on_author_id_and_created_at  (author_id,created_at)
#  index_posts_on_encouragement_id          (encouragement_id) UNIQUE
#  index_posts_on_hidden_from_ids           (hidden_from_ids) USING gin
#  index_posts_on_pinned_until              (pinned_until)
#  index_posts_on_quoted_post_id            (quoted_post_id)
#  index_posts_on_space_id                  (space_id)
#  index_posts_on_type                      (type)
#  index_posts_on_visibility                (visibility)
#  index_posts_on_visible_to_ids            (visible_to_ids) USING gin
#  index_posts_on_world_id                  (world_id)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#  fk_rails_...  (encouragement_id => encouragements.id)
#  fk_rails_...  (quoted_post_id => posts.id)
#  fk_rails_...  (world_id => worlds.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Post < ApplicationRecord
  include Noticeable
  include PgSearch::Model

  # == Constants ==

  NOTIFICATION_DELAY = T.let(
    Rails.env.production? ? 1.minute : 5.seconds,
    ActiveSupport::Duration,
  )

  # == Configuration ==

  self.inheritance_column = nil

  # == Attributes ==

  enumerize :type,
            in: %i[journal_entry poem invitation question follow_up],
            predicates: true
  enumerize :visibility, in: %i[public friends chosen_family secret]

  sig { returns(T.nilable(T::Array[String])) }
  attr_accessor :friend_ids_to_notify

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
  def fun_title
    [emoji, title].compact.join(" ").presence
  end

  sig { returns(T.nilable(String)) }
  def title_snippet
    if (title = fun_title)
      snip(title.strip.truncate(92))
    end
  end

  sig { returns(String) }
  def truncated_body_text
    body_text.strip.truncate(120)
  end

  sig { returns(String) }
  def body_snippet
    snip(truncated_body_text)
  end

  sig { returns(String) }
  def compact_body_snippet
    snip(truncated_body_text.gsub("\n\n", "\n"))
  end

  sig { returns(String) }
  def snippet
    [title_snippet, body_snippet].compact.join("\n")
  end

  sig { returns(String) }
  def compact_snippet
    [title_snippet, compact_body_snippet].compact.join("\n")
  end

  sig { returns(String) }
  def reply_snippet
    snippet + "\n\n"
  end

  # == Search ==

  pg_search_scope :search,
                  against: %i[emoji title body_html],
                  using: {
                    tsearch: {
                      websearch: true,
                    },
                  }

  # == Associations ==

  belongs_to :author, class_name: "User"
  belongs_to :quoted_post, class_name: "Post", optional: true
  belongs_to :encouragement, optional: true
  has_many :reactions, class_name: "PostReaction", dependent: :destroy
  has_many :stickers, class_name: "PostSticker", dependent: :destroy
  has_many :reply_receipts, class_name: "PostReplyReceipt", dependent: :destroy
  has_many :views, class_name: "PostView", dependent: :destroy
  has_many :shares, class_name: "PostShare", dependent: :destroy
  has_many :text_blasts, dependent: :destroy

  belongs_to :world, optional: true
  has_many :world_friends, through: :world, source: :friends

  belongs_to :space, optional: true

  sig { returns(User) }
  def author!
    author or raise ActiveRecord::RecordNotFound, "Missing author"
  end

  sig { returns(World) }
  def world!
    world or raise ActiveRecord::RecordNotFound, "Missing world"
  end

  sig { returns(T::Boolean) }
  def quoted_post? = quoted_post_id?

  # == Attachments ==

  has_many_attached :images

  # == Normalizations ==

  strips_text :title
  removes_blank :emoji

  # == Validations ==

  validates :emoji, emoji: true, allow_nil: true
  validates :type, :body_html, presence: true
  validates :title, absence: true, unless: :title_visible?
  validates :quoted_post, presence: true, if: :follow_up?
  validates :quoted_post, absence: true, unless: :follow_up?
  validates :spotify_track_id, presence: true, allow_nil: true
  validates :images_ids, length: { maximum: 4 }, absence: { if: :follow_up? }
  validate :validate_hidden_from_ids
  validate :validate_visible_to_ids
  validate :validate_no_nested_quoting, if: :quoted_post?
  validate :validate_spotify_track_id,
           if: %i[spotify_track_id? spotify_track_id_changed?]

  # == Callbacks ==

  before_validation :remove_invalid_hidden_from_ids,
                    if: %i[hidden_from_ids? hidden_from_ids_changed?]
  before_validation :remove_invalid_visible_to_ids,
                    if: %i[visible_to_ids? visible_to_ids_changed?]
  after_save :create_notifications!, if: :send_notifications?
  after_save :save_images_ids!, if: :images_changed?

  # == Scopes ==

  scope :publicly_visible, -> { where(visibility: :public) }
  scope :visible_to_friends, -> { where(visibility: %i[public friends]) }
  scope :visible_to_chosen_family, -> {
    where(visibility: %i[public friends chosen_family])
  }
  scope :secretly_visible, -> { where(visibility: :secret) }
  scope :currently_pinned, -> { where("pinned_until > ?", Time.current) }
  scope :not_hidden_from, ->(friend) {
    friend = T.let(friend, Friend)
    allowed_visibilities = %i[public friends]
    allowed_visibilities << :chosen_family if friend.chosen_family?
    where(visibility: allowed_visibilities)
      .where("NOT (? = ANY(hidden_from_ids))", friend)
  }
  scope :secretly_visible_to, ->(friend) {
    friend = T.cast(friend, Friend)
    where(visibility: :secret).where("? = ANY(visible_to_ids)", friend.id)
  }
  scope :visible_to, ->(friend) {
    friend = T.cast(friend, Friend)
    not_hidden_from(friend).or(secretly_visible_to(friend))
  }
  scope :user_created, -> {
    joins(:author)
      .where("posts.updated_at > (users.created_at + INTERVAL '1 second')")
  }
  scope :with_reactions, -> { includes(:reactions) }
  scope :with_encouragement, -> { includes(:encouragement) }
  scope :with_quoted_post_and_attached_images, -> {
    includes(quoted_post: [images_attachments: :blob])
  }
  scope :with_author, -> { includes(:author) }

  # == Noticeable ==

  sig { override.params(recipient: Notifiable).returns(NotificationMessage) }
  def notification_message(recipient:)
    title = "new #{type.humanize(capitalize: false)}"
    author = author!
    unless recipient.is_a?(Friend)
      title += " from #{author.name}"
    end
    body = ""
    if (emoji = self.emoji)
      body += "#{emoji} "
    end
    body += if (post_title = self.title)
      post_title.strip + "\n" + truncated_body_text
    else
      truncated_body_text
    end
    url_helpers = Rails.application.routes.url_helpers
    target_url = case recipient
    when Friend
      url_helpers.world_url(
        world!,
        friend_token: recipient.access_token,
        post_id: id,
        trailing_slash: true,
      )
    when User
      url_helpers.user_universe_url(post_id: id)
    else
      raise "Invalid notification recipient: #{recipient.inspect}"
    end
    NotificationMessage.new(title:, body:, image: cover_image, target_url:)
  end

  sig { params(recipient: Friend).returns(String) }
  def text_message(recipient)
    world = world!
    title = "new #{type.humanize(capitalize: false)} from #{world.name}..."
    body = ""
    if (emoji = self.emoji)
      body += "#{emoji} "
    end
    body += if (post_title = self.title)
      post_title.strip + "\n" + truncated_body_text
    else
      truncated_body_text
    end
    post_shortlink = ShortlinkService.url_helpers.world_url(
      world,
      post_id: id,
      friend_token: recipient.access_token,
      trailing_slash: true,
    )
    cta = "see full post: #{post_shortlink}"
    [title, body, cta].compact.join("\n\n")
  end

  # == Methods ==

  sig { returns(T::Boolean) }
  def user_created?
    updated_at > (author!.created_at + 1.second)
  end

  sig { returns(T.nilable(Image)) }
  def cover_image
    if (blob = cover_image_blob)
      blob.becomes(Image)
    end
  end

  sig { returns(T.nilable(ActiveStorage::Blob)) }
  def cover_image_blob
    if (id = images_ids.first)
      images_blobs.find(id)
    end
  end

  sig { returns(T::Array[ActiveStorage::Blob]) }
  def ordered_image_blobs
    attachments = images_attachments.to_a
    attachments_by_blob_id = attachments.index_by(&:blob_id)
    images_ids.filter_map { |blob_id| attachments_by_blob_id[blob_id]&.blob }
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
  def friend_viewers
    friend_ids = views.where(viewer_type: "Friend").select(:viewer_id)
    Friend.where(id: friend_ids).distinct
  end

  sig { returns(User::PrivateRelation) }
  def user_viewers
    user_ids = views.where(viewer_type: "User").select(:viewer_id)
    User.where(id: user_ids).distinct
  end

  sig { returns(PostReplyReceipt::PrivateAssociationRelation) }
  def repliers
    reply_receipts.select(:friend_id).distinct
  end

  sig do
    returns(T.any(
      Friend::PrivateCollectionProxy,
      Friend::PrivateAssociationRelation,
    ))
  end
  def hidden_from
    if (hidden_from_ids = self.hidden_from_ids.presence)
      world_friends.where(id: hidden_from_ids)
    else
      world_friends
    end
  end

  # == Notifications ==

  sig { returns(T::Boolean) }
  def send_notifications?
    user_created? && (friend_ids_to_notify.present? || visibility == :public)
  end

  sig { returns(Friend::PrivateAssociationRelation) }
  def friends_to_notify
    friends = if (notify_ids = friend_ids_to_notify)
      subscribed_type = quoted_post&.type || type
      scope = world_friends.where(id: notify_ids)
      scope = scope.where(id: visible_to_ids) if visibility == :secret
      scope.subscribed_to(subscribed_type)
    else
      world_friends.none
    end
    friends = friends.chosen_family if visibility == :chosen_family
    friends
  end

  sig { void }
  def create_notifications!
    return if visibility == :secret && friend_ids_to_notify.blank?

    delay = NOTIFICATION_DELAY if previously_new_record?
    friends = friends_to_notify
    notified_friend_ids = T.let([], T::Array[String])
    friends
      .notifiable
      .where.not(
        id: notifications
          .where(recipient_type: "Friend")
          .select(:recipient_id),
      )
      .select(:id).find_each do |friend|
        notifications.create!(recipient: friend, push_delay: delay)
        notified_friend_ids << friend.id
      end
    friends
      .text_only
      .where.not(id: text_blasts.select(:friend_id))
      .find_each do |friend|
        text_blasts.create!(friend:, send_delay: delay)
        notified_friend_ids << friend.id
      end
    if visibility == :public
      User
        .subscribed_to_public_posts
        .joins(:world)
        .where.not(world: {
          id: Friend.where(id: notified_friend_ids).select("DISTINCT world_id"),
        })
        .where.not(
          id: notifications.where(recipient_type: "User").select(:recipient_id),
        )
        .find_each do |user|
          notifications.create!(recipient: user, push_delay: delay)
        end
    end
  end

  # sig { void }
  # def create_notifications_later
  #   CreatePostNotificationsJob.perform_later(self)
  # end

  sig { returns(Friend::PrivateRelation) }
  def notified_friends
    delivered_notifications = notifications.delivered.to_friends
    Friend.where(id: delivered_notifications.select(:recipient_id)).distinct
  end

  sig { returns(Integer) }
  def push_missing_notifications_to_unseen_recipients
    redelivered_notifications_count = 0
    notifications
      .undelivered
      .where.not(recipient: friend_viewers)
      .where.not(recipient: user_viewers)
      .find_each do |notification|
        notification.push
        redelivered_notifications_count += 1
      end
    redelivered_notifications_count
  end

  private

  # == Helpers ==

  sig { params(friend_ids: T::Array[String]).returns(T::Array[String]) }
  def select_world_friend_ids(friend_ids)
    world_friends.where(id: friend_ids).pluck(:id)
  end

  sig { params(text: String).returns(String) }
  def snip(text)
    "> " + text.split("\n").join("\n> ")
  end

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

  # == Validators ==

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

  sig { void }
  def validate_spotify_track_id
    track_id = spotify_track_id or return
    unless SpotifyService.get_track(track_id)
      errors.add(
        :spotify_track_id,
        :invalid,
        message: "invalid Spotify track",
      )
    end
  end

  sig { void }
  def validate_hidden_from_ids
    if visibility == :secret && hidden_from_ids.present?
      errors.add(
        :hidden_from_ids,
        :invalid,
        message: "cannot be set for secret posts",
      )
    end
  end

  sig { void }
  def validate_visible_to_ids
    if visibility != :secret && visible_to_ids.present?
      errors.add(
        :visible_to_ids,
        :invalid,
        message: "can only be set for secret posts",
      )
    end
  end

  # == Callback Handlers ==

  sig { void }
  def remove_invalid_hidden_from_ids
    self.hidden_from_ids = select_world_friend_ids(hidden_from_ids)
  end

  sig { void }
  def remove_invalid_visible_to_ids
    self.visible_to_ids = select_world_friend_ids(visible_to_ids)
  end
end
