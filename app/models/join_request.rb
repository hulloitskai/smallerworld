# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: join_requests
#
#  id           :uuid             not null, primary key
#  name         :string           not null
#  phone_number :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  user_id      :uuid             not null
#
# Indexes
#
#  index_join_requests_on_user_id  (user_id)
#  index_join_requests_uniqueness  (user_id,phone_number) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class JoinRequest < ApplicationRecord
  include NormalizesPhoneNumber
  include Noticeable

  # == Associations
  belongs_to :user
  has_one :friend, dependent: :nullify

  sig { returns(User) }
  def user!
    user or raise ActiveRecord::RecordNotFound, "Missing associated user"
  end

  # == Normalizations
  strips_text :name
  normalizes_phone_number :phone_number

  # == Validations
  validates :name, :phone_number, presence: true
  validates :phone_number, uniqueness: { scope: :user }

  # == Scopes
  scope :pending, -> { where.missing(:friend) }
  scope :accepted, -> { where.associated(:friend) }

  # == Callbacks
  after_create :create_notification!

  # == Noticeable
  sig do
    override
      .params(recipient: T.nilable(NotificationRecipient))
      .returns(NotificationMessage)
  end
  def notification_message(recipient:)
    unless recipient.nil? || recipient.is_a?(User)
      raise "Invalid recipient for #{self.class} notification: " \
        "#{recipient.inspect}"
    end
    NotificationMessage.new(
      title: "#{name} wants to join your world!",
      body: "request from #{name} (#{phone_number})",
      target_url: Rails.application.routes.url_helpers
        .join_requests_url(join_request_id: id),
    )
  end

  sig do
    override
      .params(recipient: T.nilable(NotificationRecipient))
      .returns(T::Hash[String, T.untyped])
  end
  def legacy_notification_payload(recipient)
    payload = JoinRequestNotificationPayload.new(
      join_request: self,
    )
    JoinRequestNotificationPayloadSerializer.one(payload)
  end

  # == Methods
  sig { void }
  def create_notification!
    notifications.create!(recipient: user!)
  end
end
