# typed: true
# frozen_string_literal: true

require "sorbet-runtime"

module Fullstory
  extend T::Sig

  class Settings < T::Struct
    const :org_id, String
  end

  # == Methods
  sig { returns(T.nilable(Settings)) }
  def self.settings
    return @_settings if defined?(@_settings)

    @_settings = if (credentials = self.credentials)
      Settings.new(org_id: credentials.org_id!)
    end
  end

  # == Helpers
  sig { returns(T.untyped) }
  def self.credentials
    Rails.application.credentials.fullstory
  end
end
