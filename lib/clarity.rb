# typed: true
# frozen_string_literal: true

require "sorbet-runtime"

module Clarity
  extend T::Sig

  class Settings < T::Struct
    # == Properties
    const :project_id, String
  end

  # == Methods
  sig { returns(T.nilable(Settings)) }
  def self.settings
    return @_settings if defined?(@_settings)

    @_settings = if (credentials = self.credentials)
      Settings.new(project_id: credentials.project_id!)
    end
  end

  # == Helpers
  sig { returns(T.untyped) }
  def self.credentials
    Rails.application.credentials.clarity
  end
end
