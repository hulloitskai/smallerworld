# typed: true
# frozen_string_literal: true

class TwilioService < ApplicationService
  # == Configuration
  sig { override.returns(T::Boolean) }
  def self.enabled?
    Twilio.account_sid.present? && Twilio.auth_token.present?
  end

  # == Initialization
  sig { void }
  def initialize
    super
    @client = Twilio::REST::Client.new
  end

  # == Methods
  sig { params(to: String, body: String).returns(T.untyped) }
  def send_message(to:, body:)
    @client.messages.create(from: sender_number, to:, body:)
  end

  # == Helpers
  sig { returns(String) }
  def sender_number
    twilio_credentials.sender_number!
  end

  private

  # == Helpers
  sig { returns(T.untyped) }
  def twilio_credentials
    Rails.application.credentials.twilio!
  end
end
