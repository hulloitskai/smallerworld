# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: activity_coupons
#
#  id          :uuid             not null, primary key
#  expires_at  :datetime         not null
#  redeemed_at :datetime
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  activity_id :uuid             not null
#  friend_id   :uuid             not null
#
# Indexes
#
#  index_activity_coupons_on_activity_id  (activity_id)
#  index_activity_coupons_on_expires_at   (expires_at)
#  index_activity_coupons_on_friend_id    (friend_id)
#  index_activity_coupons_on_redeemed_at  (redeemed_at)
#
# Foreign Keys
#
#  fk_rails_...  (activity_id => activities.id)
#  fk_rails_...  (friend_id => friends.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class ActivityCoupon < ApplicationRecord
  include Noticeable

  # == Attributes ==

  attribute :expires_at, default: -> { 1.month.from_now }

  sig { returns(T::Boolean) }
  def redeemed? = redeemed_at?

  # == Associations ==

  belongs_to :friend
  belongs_to :activity
  has_one :user, through: :activity
  has_many :notifications, as: :noticeable, dependent: :destroy

  sig { returns(Friend) }
  def friend!
    friend or raise ActiveRecord::RecordNotFound, "Missing associated friend"
  end

  sig { returns(Activity) }
  def activity!
    activity or raise ActiveRecord::RecordNotFound,
                      "Missing associated activity"
  end

  sig { returns(User) }
  def user!
    user or raise ActiveRecord::RecordNotFound, "Missing associated user"
  end

  # == Validations ==

  validate :validate_no_other_identical_active_coupons

  # == Callbacks ==

  after_create :create_notification!

  # == Scopes ==

  scope :expired, -> { where(expires_at: ..Time.current) }
  scope :redeemed, -> { where.not(redeemed_at: nil) }
  scope :active, -> {
    where("expires_at > ?", Time.current).where(redeemed_at: nil)
  }
  scope :without_recent_notification, -> {
    recently_notified_ids = joins(:notifications)
      .where("notifications.created_at > ?", 1.week.ago)
      .select(:noticeable_id)
    where.not(id: recently_notified_ids)
  }

  # == Noticeable ==

  sig { override.params(recipient: Notifiable).returns(NotificationMessage) }
  def notification_message(recipient:)
    case recipient
    when Friend
      activity = activity!
      NotificationMessage.new(
        title: "You've got a coupon for: #{activity.name}",
        body: "This coupon expires in " \
          "#{ExpiryFormatter.relative_to_now(expires_at)}, redeem it soon!",
        target_url: Rails.application.routes.url_helpers.user_url(
          user!,
          friend_token: recipient.access_token,
          anchor: "#invitations",
          trailing_slash: true,
        ),
      )
    else
      raise "Invalid notification recipient: #{recipient.inspect}"
    end
  end

  # == Methods ==

  sig { void }
  def create_notification!
    notifications.create!(recipient: friend!)
  end

  sig { returns(T.nilable(Notification)) }
  def recent_notification
    notifications.chronological.where("created_at > ?", 1.week.ago).last
  end

  sig { void }
  def mark_as_redeemed!
    update!(redeemed_at: Time.current)
  end

  private

  # == Validators ==

  sig { void }
  def validate_no_other_identical_active_coupons
    if friend!.activity_coupons.active.where.not(id:).exists?(activity:)
      errors.add(
        :base,
        :uniqueness,
        message: "There is another active coupon for this activity",
      )
    end
  end
end
