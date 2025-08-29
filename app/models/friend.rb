# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: friends
#
#  id                            :uuid             not null, primary key
#  access_token                  :string           not null
#  chosen_family                 :boolean          not null
#  emoji                         :string
#  name                          :string           not null
#  notifications_last_cleared_at :datetime
#  paused_since                  :datetime
#  phone_number                  :string
#  subscribed_post_types         :string           not null, is an Array
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#  deprecated_join_request_id    :uuid
#  invitation_id                 :uuid
#  user_id                       :uuid             not null
#
# Indexes
#
#  index_friends_name_uniqueness                   (name,user_id) UNIQUE
#  index_friends_on_access_token                   (access_token) UNIQUE
#  index_friends_on_chosen_family                  (chosen_family)
#  index_friends_on_deprecated_join_request_id     (deprecated_join_request_id)
#  index_friends_on_invitation_id                  (invitation_id)
#  index_friends_on_notifications_last_cleared_at  (notifications_last_cleared_at)
#  index_friends_on_phone_number                   (phone_number)
#  index_friends_on_user_id                        (user_id)
#  index_friends_phone_number_uniqueness           (user_id,phone_number) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (deprecated_join_request_id => join_requests.id)
#  fk_rails_...  (invitation_id => invitations.id)
#  fk_rails_...  (user_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Friend < ApplicationRecord
  include NormalizesPhoneNumber
  include Notifiable
  include Noticeable
  include PgSearch::Model

  # == Attributes
  enumerize :subscribed_post_types,
            in: Post.type.values,
            multiple: true,
            default: Post.type.values
  attribute :chosen_family, default: false
  has_secure_token :access_token

  sig { returns(T::Boolean) }
  def paused? = paused_since?

  sig { returns(String) }
  def fun_name
    [emoji, name].compact.join(" ")
  end

  # == Tokens
  generates_token_for :invite

  sig { returns(String) }
  def generate_deprecated_invite_token
    generate_token_for(:invite)
  end

  sig { params(token: String).returns(Friend) }
  def self.find_by_deprecated_invite_token!(token)
    find_by_token_for!(:invite, token)
  end

  # == Associations
  belongs_to :user
  has_many :user_posts, through: :user, source: :posts

  has_many :activity_coupons, dependent: :destroy
  has_many :active_activity_coupons,
           -> {
             T.bind(self, ActivityCoupon::PrivateRelation)
             active
           },
           class_name: "ActivityCoupon",
           dependent: :destroy,
           inverse_of: :friend
  has_many :offered_activities,
           through: :active_activity_coupons,
           source: :activity

  belongs_to :invitation, optional: true
  has_one :join_request, through: :invitation

  belongs_to :deprecated_join_request, class_name: "JoinRequest", optional: true
  has_many :post_reactions, dependent: :destroy
  has_many :post_reply_receipts, dependent: :destroy
  has_many :post_views, dependent: :destroy
  has_many :encouragements, dependent: :destroy
  has_many :text_blasts, dependent: :destroy

  sig { returns(User) }
  def user!
    user or raise ActiveRecord::RecordNotFound, "Missing associated user"
  end

  # == Normalizations
  strips_text :name
  removes_blank :emoji
  normalizes_phone_number :phone_number

  # == Validations
  validates :name, presence: true, uniqueness: { scope: :user }
  validates :emoji, emoji: true, allow_nil: true
  validates :phone_number,
            phone: { possible: true, types: :mobile, extensions: false },
            uniqueness: { scope: :user, message: "already joined" },
            allow_nil: true

  # == Scopes
  scope :active, -> { where(paused_since: nil) }
  scope :paused, -> { where.not(paused_since: nil) }
  scope :paused_during, ->(interval) {
    joins(:user_posts)
      .where("posts.created_at" => interval)
      .where("friends.id = ANY(posts.hidden_from_ids)")
  }
  scope :subscribed_to, ->(post_type) {
    where("? = ANY (subscribed_post_types)", post_type)
  }
  scope :chosen_family, -> { where(chosen_family: true) }
  scope :with_active_activity_coupons, -> {
    includes(:active_activity_coupons)
  }
  scope :with_push_registrations, -> {
    includes(:push_registrations)
  }
  scope :text_only, -> {
    where.missing(:push_registrations)
      .where.not(phone_number: nil)
  }

  # == Search
  pg_search_scope :search,
                  against: %i[emoji name],
                  using: {
                    tsearch: {
                      websearch: true,
                    },
                  }

  # == Callbacks
  after_create_commit :create_notification!

  # == Noticeable
  sig do
    override
      .params(recipient: T.nilable(NotificationRecipient))
      .returns(NotificationMessage)
  end
  def notification_message(recipient:)
    unless recipient.is_a?(User)
      raise "Invalid recipient for #{self.class} notification: " \
        "#{recipient.inspect}"
    end
    if push_registrations.exists?
      NotificationMessage.new(
        title: "#{fun_name} installed your world!",
        body: "#{name} installed your world on their phone :)",
        target_url: Rails.application.routes.url_helpers
          .world_friends_url(friend_id: id),
      )
    else
      NotificationMessage.new(
        title: "#{fun_name} joined your world!",
        body: "#{name} subscribed to text updates",
        target_url: Rails.application.routes.url_helpers
          .world_friends_url(friend_id: id),
      )
    end
  end

  sig do
    override
      .params(recipient: T.nilable(T.all(ApplicationRecord, Notifiable)))
      .returns(T::Hash[String, T.untyped])
  end
  def legacy_notification_payload(recipient)
    payload = FriendNotificationPayload.new(friend: self)
    LegacyFriendNotificationPayloadSerializer.one(payload)
  end

  # == Installation
  sig { returns(String) }
  def installation_message
    user = user!
    user_possessive = scoped do
      name = user.name
      name.end_with?("s") ? "#{name}'" : "#{name}'s"
    end
    installation_url = user.shortlink_url(
      friend_token: access_token,
      intent: "installation_instructions",
    )
    <<~EOF
      hi, #{fun_name}! here's your secret link to #{user_possessive} world: #{installation_url}

      we'll send you occasional text updates, but if you're a REAL ONE you can click the link to install #{user_possessive} world for real-time life updates.
    EOF
  end

  sig { void }
  def send_installation_message!
    to = phone_number or raise "Missing phone number"
    TwilioService.send_message(to:, body: installation_message)
  end

  # == Methods
  sig { returns(ActiveSupport::TimeWithZone) }
  def last_active_at
    notifications_last_cleared_at || created_at
  end

  sig { returns(T.nilable(Encouragement)) }
  def latest_visible_encouragement
    transaction do
      visible_encouragements = encouragements
        .where("created_at > ?", 12.hours.ago)
      if (created_at = latest_user_post_created_at)
        visible_encouragements = visible_encouragements
          .where("created_at > ?", created_at)
      end
      visible_encouragements.reverse_chronological.first
    end
  end

  sig { void }
  def create_notification!
    notifications.create!(recipient: user!)
  end

  private

  # == Helpers
  sig { returns(T.nilable(ActiveSupport::TimeWithZone)) }
  def latest_user_post_created_at
    user_posts.reverse_chronological.pick(:created_at)
  end
end
