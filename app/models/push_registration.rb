# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: push_registrations
#
#  id                                :uuid             not null, primary key
#  deprecated_service_worker_version :integer
#  device_fingerprint                :string           not null
#  device_fingerprint_confidence     :float(24)        not null
#  owner_type                        :string
#  created_at                        :datetime         not null
#  updated_at                        :datetime         not null
#  device_id                         :uuid             not null
#  owner_id                          :uuid
#  push_subscription_id              :uuid             not null
#
# Indexes
#
#  index_push_registrations_on_device_fingerprint    (device_fingerprint)
#  index_push_registrations_on_device_id             (device_id)
#  index_push_registrations_on_owner                 (owner_type,owner_id)
#  index_push_registrations_on_push_subscription_id  (push_subscription_id)
#  index_push_registrations_uniqueness               (owner_type,owner_id,push_subscription_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (push_subscription_id => push_subscriptions.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class PushRegistration < ApplicationRecord
  # == Associations
  belongs_to :owner, polymorphic: true, optional: true
  belongs_to :push_subscription, inverse_of: :registrations
  delegate :service_worker_version, to: :push_subscription

  sig { returns(PushSubscription) }
  def push_subscription!
    push_subscription or
      raise ActiveRecord::RecordNotFound, "Missing associated push subscription"
  end

  # == Validations
  validates :push_subscription, uniqueness: { scope: :owner }

  # == Callbacks
  after_create :create_friend_notification!
  after_create :create_activity_coupon_notification!

  # == Methods
  sig { params(notification: Notification, urgency: T.nilable(Symbol)).void }
  def push(notification, urgency: nil)
    serializer = if service_worker_version.to_i > 1
      NotificationSerializer
    elsif notification.legacy_payload.present?
      LegacyNotificationSerializer
    else
      return
    end

    payload = {
      "notification" => serializer.one(notification),
      "pageIconUrl" => page_icon_url,
    }
    if (recipient = notification.recipient)
      payload["badgeCount"] = recipient
        .notifications_received_since_last_cleared
        .count
    end
    push_subscription!.push_payload(payload.compact, urgency:)
  end

  sig { void }
  def push_test_notification
    payload = {
      "pageIconUrl" => page_icon_url,
    }
    if service_worker_version.to_i > 1
      message = NotificationMessage.new(
        title: "test notification",
        body: "this is a test notification. if you are seeing this, then " \
          "your push notifications are working!",
      )
      payload["message"] = NotificationMessageSerializer.one(message)
    end
    push_subscription!.push_payload(payload.compact, urgency: :high)
  end

  # == Callback handlers
  sig { void }
  def create_friend_notification!
    transaction do
      owner = self.owner
      if owner.is_a?(Friend) && !owner.push_registrations.where.not(id:).exists?
        owner.create_notification!
      end
    end
  end

  sig { void }
  def create_activity_coupon_notification!
    transaction do
      owner = self.owner
      if owner.is_a?(Friend)
        owner.activity_coupons.active
          .where.missing(:notifications)
          .find_each(&:create_notification!)
      end
    end
  end

  private

  # == Helpers
  sig { returns(T.nilable(String)) }
  def page_icon_url
    owner = self.owner
    icon_blob = case owner
    when User
      owner.page_icon_blob
    when Friend
      owner.user&.page_icon_blob
    end
    if icon_blob
      variant = icon_blob.variant(resize_to_fill: [192, 192])
      Rails.application.routes.url_helpers.rails_representation_path(variant)
    end
  end
end
