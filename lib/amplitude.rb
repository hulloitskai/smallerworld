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
    if (amplitude = Rails.application.credentials.amplitude)
      Settings.new(api_key: amplitude.api_key!)
    end
  end
end
