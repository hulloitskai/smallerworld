# typed: true
# frozen_string_literal: true

require "sorbet-runtime"
require_relative "stytch/telemetry_client"

module Stytch
  extend T::Sig

  class Settings < T::Struct
    # == Properties
    const :project_id, String
    const :secret, String, sensitivity: []
    const :public_token, String
  end

  # == Methods
  sig { returns(Settings) }
  def self.settings
    @_settings ||= scoped do
      credentials = credentials!
      Settings.new(
        project_id: credentials.project_id!,
        secret: credentials.secret!,
        public_token: credentials.public_token!,
      )
    end
  end

  sig { returns(TelemetryClient) }
  def self.telemetry_client
    @_telemetry_client ||= TelemetryClient.new(
      project_id: settings.project_id,
      secret: settings.secret,
    )
  end

  # == Helpers
  sig { returns(T.untyped) }
  def self.credentials!
    Rails.application.credentials.stytch!
  end
end
