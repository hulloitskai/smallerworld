# typed: true
# frozen_string_literal: true

class GreenApiService < ApplicationService
  # == Configuration
  sig { override.returns(T::Boolean) }
  def self.enabled?
    return false unless credentials_available?

    credentials = credentials!
    credentials.api_url.present? &&
      credentials.id_instance.present? &&
      credentials.api_token_instance.present?
  end

  # == Initialization
  sig { void }
  def initialize
    super
    credentials = self.class.credentials!
    @conn = Faraday.new(credentials.api_url!) do |f|
      f.response(:logger, Rails.logger, bodies: true, errors: true)
      f.request(:json)
      f.response(:json)
    end
  end

  sig { returns(Faraday::Connection) }
  attr_reader :conn

  # == Methods
  sig { params(phone_number: String).returns(T.nilable(T::Boolean)) }
  def self.reachable_on_whatsapp?(phone_number)
    credentials = credentials!
    id_instance = credentials.id_instance!
    api_token_instance = credentials.api_token_instance!
    response = instance.conn.post(
      "/waInstance#{id_instance}/checkWhatsapp/#{api_token_instance}",
      { "phoneNumber" => phone_number },
    )
    response.body["existsWhatsapp"]
  end

  # == Helpers
  sig { returns(T::Boolean) }
  def self.credentials_available?
    Rails.application.credentials.green_api.present?
  end

  sig { returns(T.untyped) }
  def self.credentials!
    Rails.application.credentials.green_api!
  end
end
