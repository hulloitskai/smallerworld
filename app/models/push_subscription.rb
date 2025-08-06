# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: push_subscriptions
#
#  id                     :uuid             not null, primary key
#  auth_key               :string           not null
#  endpoint               :string           not null
#  p256dh_key             :string           not null
#  service_worker_version :integer
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_push_subscriptions_on_endpoint  (endpoint) UNIQUE
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class PushSubscription < ApplicationRecord
  # == Associations
  has_many :registrations, class_name: "PushRegistration", dependent: :destroy

  # == Validations
  validates :endpoint, uniqueness: { message: "already registered" }
  validates :registrations, presence: true

  # == Methods
  sig { params(message: String, urgency: T.nilable(Symbol)).void }
  def push_message(message, urgency: nil)
    options = { urgency: }.compact
    response = T.unsafe(WebPush).payload_send(
      endpoint:,
      p256dh: p256dh_key,
      auth: auth_key,
      vapid: {
        **vapid_credentials,
        subject: Contact.plain_mailto_uri.to_s,
      },
      message:,
      **options,
    )
    tag_logger do
      logger.info("Sent web push: #{response.inspect}")
    end
  rescue WebPush::ExpiredSubscription, WebPush::InvalidSubscription => error
    message = T.let(error.response.body, String)
    tag_logger do
      logger.warn("Bad subscription: #{message}")
    end
    destroy or tag_logger do |; message| # rubocop:disable Layout/SpaceAroundBlockParameters
      message = "Failed to destroy expired or invalid push subscription"
      logger.error(message)
      Sentry.capture_message(message)
    end
  rescue WebPush::ResponseError => error
    message = error.response.body
    tag_logger do
      error_message = "Web push error: #{message}"
      logger.error(error_message)
      Sentry.capture_message(error_message)
    end
  end

  sig do
    params(
      payload: T::Hash[T.any(Symbol, String), T.untyped],
      urgency: T.nilable(Symbol),
    ).void
  end
  def push_payload(payload, urgency: nil)
    push_message(payload.to_json, urgency:)
  end

  private

  # == Helpers
  sig { returns(T.untyped) }
  def web_push_credentials
    Rails.application.credentials.web_push!
  end

  sig { returns({ private_key: String, public_key: String }) }
  def vapid_credentials
    private_key = T.let(web_push_credentials.private_key!, String)
    public_key = T.let(web_push_credentials.public_key!, String)
    { private_key:, public_key: }
  end
end
