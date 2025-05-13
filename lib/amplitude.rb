# typed: true
# frozen_string_literal: true

require "sorbet-runtime"

module Amplitude
  extend T::Sig

  class Settings < T::Struct
    const :api_key, String
  end

  # == Methods
  sig { returns(T.nilable(Settings)) }
  def self.settings
    return @_settings if defined?(@_settings)

    @_settings = if (credentials = self.credentials)
      Settings.new(api_key: credentials.api_key!)
    end
  end

  # == Helpers
  sig { returns(T.untyped) }
  def self.credentials
    Rails.application.credentials.amplitude
  end
end
