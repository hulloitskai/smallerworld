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
    supabase = Rails.application.credentials.supabase!
    Settings.new(
      project_id: supabase.project_id!,
      public_key: supabase.public_key!,
    )
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
end
