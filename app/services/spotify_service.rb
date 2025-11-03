# typed: true
# frozen_string_literal: true

class SpotifyService < ApplicationService
  # == Configuration
  sig { override.returns(T::Boolean) }
  def self.enabled?
    return false unless credentials_available?

    credentials = credentials!
    credentials.client_id.present? && credentials.client_secret.present?
  end

  # == Initialization
  sig { void }
  def initialize
    super
    credentials = self.class.credentials!
    RSpotify.authenticate(
      credentials.client_id!,
      credentials.client_secret!,
    )
  end

  # == Methods
  sig { params(id: String).returns(T.nilable(RSpotify::Track)) }
  def self.get_track(id)
    authenticated do
      RSpotify::Track.find(id)
    rescue RestClient::BadRequest
      nil
    end
  end

  # == Helpers
  sig { returns(T::Boolean) }
  def self.credentials_available?
    Rails.application.credentials.spotify.present?
  end

  def self.credentials!
    Rails.application.credentials.spotify!
  end

  sig do
    type_parameters(:U)
      .params(block: T.proc.returns(T.type_parameter(:U)))
      .returns(T.type_parameter(:U))
  end
  private_class_method def self.authenticated(&block)
    instance
    yield
  end
end
