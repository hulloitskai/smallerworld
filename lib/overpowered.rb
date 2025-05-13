# typed: true
# frozen_string_literal: true

require "sorbet-runtime"

module Overpowered
  extend T::Sig

  class Settings < T::Struct
    const :api_key, String
  end

  # == Methods
  sig { returns(Settings) }
  def self.settings
    @_settings ||= scoped do
      credentials = credentials!
      Settings.new(api_key: credentials.api_key!)
    end
  end

  # == Helpers
  sig { returns(T.untyped) }
  def self.credentials!
    Rails.application.credentials.overpowered!
  end
end
