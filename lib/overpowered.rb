# typed: true
# frozen_string_literal: true

require "sorbet-runtime"

module Overpowered
  extend T::Sig

  class Settings < T::Struct
    extend T::Sig

    # == Properties
    const :api_key, String
    const :worker_base_url, String
    const :script_path, String
    const :fingerprint_path, String

    # == Methods
    sig { returns(String) }
    def script_url
      "#{worker_base_url}/#{script_path}"
    end

    sig { returns(String) }
    def fingerprint_url
      "#{worker_base_url}/#{fingerprint_path}"
    end
  end

  # == Methods
  sig { returns(Settings) }
  def self.settings
    @_settings ||= scoped do
      credentials = credentials!
      Settings.new(
        api_key: credentials.api_key!,
        worker_base_url: credentials.worker_base_url!,
        script_path: credentials.script_path!,
        fingerprint_path: credentials.fingerprint_path!,
      )
    end
  end

  # == Helpers
  sig { returns(T.untyped) }
  def self.credentials!
    Rails.application.credentials.overpowered!
  end
end
