# typed: true
# frozen_string_literal: true

require "sorbet-runtime"

module Canny
  extend T::Sig

  class Settings < T::Struct
    extend T::Sig

    # == Properties
    const :app_id, String
    const :private_key, String
    const :feature_requests_board_token, String
    const :bugs_board_token, String
  end

  # == Methods
  sig { returns(T.nilable(Settings)) }
  def self.settings
    return @_settings if defined?(@_settings)

    @_settings = if (credentials = self.credentials)
      Settings.new(
        app_id: credentials.app_id!,
        private_key: credentials.private_key!,
        feature_requests_board_token: credentials.feature_requests_board_token!,
        bugs_board_token: credentials.bugs_board_token!,
      )
    end
  end

  # == Helpers
  sig { returns(T.untyped) }
  def self.credentials
    Rails.application.credentials.canny
  end
end
