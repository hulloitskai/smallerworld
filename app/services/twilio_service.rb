# typed: true
# frozen_string_literal: true

class TwilioService < ApplicationService
  # == Configuration
  sig { override.returns(T::Boolean) }
  def self.enabled?
    Twilio.account_sid.present? && Twilio.auth_token.present?
  end

  # == Methods
  sig { params(to: String, body: String).returns(T.untyped) }
  def self.send_message(to:, body:)
    twilio_client.messages.create(from: sender_number, to:, body:)
  end

  # == Helpers
  sig { returns(String) }
  def self.sender_number
    twilio_credentials.sender_number!
  end

  private

  # == Helpers
  sig { returns(T.untyped) }
  private_class_method def self.twilio_credentials
    Rails.application.credentials.twilio!
  end

  sig { returns(T.untyped) }
  private_class_method def self.twilio_client
    @client ||= Twilio::REST::Client.new
  end
end
