# typed: true
# frozen_string_literal: true

require "sorbet-runtime"

module Canny
  extend T::Sig

  class Settings < T::Struct
    extend T::Sig

    # == Properties
    const :app_id, String
  end

  # == Methods
  sig { returns(T.nilable(Settings)) }
  def self.settings
    return @_settings if defined?(@_settings)

    @_settings = if (credentials = self.credentials)
      Settings.new(app_id: credentials.app_id!)
    end
  end

  # == Helpers
  sig { returns(T.untyped) }
  def self.credentials
    Rails.application.credentials.canny
  end
end
