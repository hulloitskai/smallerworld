# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: notifications
#
#  id              :uuid             not null, primary key
#  delivered_at    :datetime
#  delivery_token  :string           not null
#  noticeable_type :string           not null
#  pushed_at       :datetime
#  recipient_type  :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  noticeable_id   :uuid             not null
#  recipient_id    :uuid             not null
#
# Indexes
#
#  index_notifications_on_delivery_token  (delivery_token) UNIQUE
#  index_notifications_on_noticeable      (noticeable_type,noticeable_id)
#  index_notifications_on_recipient       (recipient_type,recipient_id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Notification < ApplicationRecord
  # == Attributes
  has_secure_token :delivery_token

  sig { returns(T::Boolean) }
  def pushed? = pushed_at?

  sig { returns(T::Boolean) }
  def delivered? = delivered_at?

  # == Associations
  belongs_to :noticeable, polymorphic: true
  belongs_to :recipient, polymorphic: true

  sig { returns(T.all(ActiveRecord::Base, Notifiable)) }
  def recipient
    super
  end

  sig do
    type_parameters(:U)
      .params(value: T.all(
        T.type_parameter(:U),
        ActiveRecord::Base,
        Notifiable,
      ))
      .returns(T.type_parameter(:U))
  end
  def recipient=(value)
    super
  end

  sig { returns(Noticeable) }
  def noticeable!
    noticeable or raise ActiveRecord::RecordNotFound, "Missing noticeable"
  end

  # == Callbacks
  after_create_commit :push_later, unless: :pushed?

  # == Methods
  sig { returns(T::Hash[String, T.untyped]) }
  def payload
    noticeable!.notification_payload(recipient)
  end

  sig { void }
  def push
    PushSubscription.where(owner: recipient).find_each do |subscription|
      subscription.push(self)
    end
    mark_as_pushed!
  end

  sig { void }
  def push_later
    PushNotificationJob.perform_later(self)
  end

  sig { void }
  def mark_as_pushed!
    update!(pushed_at: Time.current) unless pushed?
  end

  sig { void }
  def mark_as_delivered!
    update!(delivered_at: Time.current) unless delivered?
  end
end
