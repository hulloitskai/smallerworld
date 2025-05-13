# typed: true
# frozen_string_literal: true

require "sorbet-runtime"

module Supabase
  extend T::Sig

  class Settings < T::Struct
    const :project_id, String
    const :public_key, String
  end

  # == Methods
  sig { returns(Settings) }
  def self.settings
    @_settings ||= scoped do
      credentials = credentials!
      Settings.new(
        project_id: credentials.project_id!,
        public_key: credentials.public_key!,
      )
    end
  end

  sig { returns(String) }
  def self.url
    "https://#{settings.project_id}.supabase.co"
  end

  sig { returns(Faraday::Connection) }
  def self.client
    @_client ||= Faraday.new(url:) do |conn|
      conn.headers["apikey"] = settings.public_key
      conn.request(:json)
      conn.response(:json)
    end
  end

  # == Helpers
  sig { returns(T.untyped) }
  def self.credentials!
    Rails.application.credentials.supabase!
  end
end
