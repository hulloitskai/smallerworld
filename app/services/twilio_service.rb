# typed: true
# frozen_string_literal: true

class TwilioService < ApplicationService
  # == Configuration
  sig { override.returns(T::Boolean) }
  def self.enabled?
    return false unless credentials_available?

    Twilio.account_sid.present? && Twilio.auth_token.present?
  end

  # == Initialization
  sig { void }
  def initialize
    super
    @client = Twilio::REST::Client.new
  end

  sig { returns(Twilio::REST::Client) }
  attr_reader :client

  # == Methods
  sig { params(to: String, body: String).returns(T.untyped) }
  def self.send_message(to:, body:)
    from = credentials!.sender_number!
    instance.client.messages.create(from:, to:, body:)
  end

  # == Helpers
  sig { returns(T::Boolean) }
  def self.credentials_available?
    Rails.application.credentials.twilio.present?
  end

  def self.credentials!
    Rails.application.credentials.twilio!
  end
end
