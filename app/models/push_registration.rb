# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: push_registrations
#
#  id                            :uuid             not null, primary key
#  device_fingerprint            :string           not null
#  device_fingerprint_confidence :float(24)        not null
#  owner_type                    :string
#  service_worker_version        :integer
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#  device_id                     :uuid             not null
#  owner_id                      :uuid
#  push_subscription_id          :uuid             not null
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

  sig { returns(PushSubscription) }
  def push_subscription!
    push_subscription or
      raise ActiveRecord::RecordNotFound, "Missing associated push subscription"
  end

  # == Validations
  validates :push_subscription, uniqueness: { scope: :owner }

  # == Callbacks
  after_create :create_friend_notification!

  # == Methods
  sig { params(notification: Notification).void }
  def push(notification)
    payload = {
      notification: PushNotificationSerializer.one(notification),
      "pageIconUrl" => page_icon_url,
    }
    if (recipient = notification.recipient)
      payload["badgeCount"] = recipient
        .notifications_received_since_last_cleared
        .count
    end
    push_subscription!.push_payload(payload.compact)
  end

  sig { void }
  def push_test_notification
    payload = { "pageIconUrl" => page_icon_url }
    push_subscription!.push_payload(payload.compact, urgency: :high)
  end

  private

  # == Heleprs
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

  sig { void }
  def create_friend_notification!
    transaction do
      owner = self.owner
      if owner.is_a?(Friend) && !owner.push_registrations.where.not(id:).exists?
        owner.create_notification!
      end
    end
  end
end
