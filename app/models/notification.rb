# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: notifications
#
#  id                        :uuid             not null, primary key
#  delivered_at              :datetime
#  deprecated_delivery_token :string
#  noticeable_type           :string           not null
#  pushed_at                 :datetime
#  recipient_type            :string
#  created_at                :datetime         not null
#  updated_at                :datetime         not null
#  noticeable_id             :uuid             not null
#  recipient_id              :uuid
#
# Indexes
#
#  index_notifications_on_deprecated_delivery_token  (deprecated_delivery_token) UNIQUE
#  index_notifications_on_noticeable                 (noticeable_type,noticeable_id)
#  index_notifications_on_recipient                  (recipient_type,recipient_id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Notification < ApplicationRecord
  # == Attributes
  sig { returns(T.nilable(ActiveSupport::Duration)) }
  attr_accessor :push_delay

  sig { returns(T::Boolean) }
  def pushed?
    pushed_at?
  end

  sig { returns(T::Boolean) }
  def delivered? = delivered_at?

  # == Associations
  belongs_to :noticeable, polymorphic: true
  belongs_to :recipient,
             polymorphic: true,
             optional: true,
             inverse_of: :received_notifications

  sig { returns(Noticeable) }
  def noticeable!
    noticeable or
      raise ActiveRecord::RecordNotFound, "Missing associated noticeable"
  end

  # == Callbacks
  after_create :push_later, unless: :pushed?

  # == Scopes
  scope :to_friends, -> { where(recipient_type: "Friend") }
  scope :to_users, -> { where(recipient_type: "User") }
  scope :to_anonymous, -> { where(recipient_type: nil) }
  scope :delivered, -> { where.not(delivered_at: nil) }
  scope :undelivered, -> { where(delivered_at: nil) }

  # == Delivery token
  generates_token_for :delivery do
    delivered?
  end

  sig { returns(T.nilable(String)) }
  def generate_delivery_token
    generate_token_for(:delivery) unless delivered?
  end

  sig { params(token: String).returns(T.nilable(Notification)) }
  def self.find_by_delivery_token(token)
    find_by_token_for(:delivery, token)
  end

  sig { returns(T.nilable(String)) }
  def delivery_token
    deprecated_delivery_token || generate_delivery_token
  end

  # == Methods
  sig { returns(String) }
  def type
    noticeable!.notification_type(recipient)
  end

  sig { returns(T::Hash[String, T.untyped]) }
  def payload
    noticeable!.notification_payload(recipient)
  end

  sig { void }
  def push
    PushRegistration.where(owner: recipient).find_each do |registration|
      registration.push(self)
    end
    mark_as_pushed!
  end

  sig { void }
  def push_later
    job = PushNotificationJob
    if (wait = push_delay)
      job = job.set(wait:)
    end
    job.perform_later(self)
  end

  sig { void }
  def mark_as_pushed!
    update!(pushed_at: Time.current)
  end

  sig { void }
  def mark_as_delivered!
    update!(delivered_at: Time.current)
  end
end
