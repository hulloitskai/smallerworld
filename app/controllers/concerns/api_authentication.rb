# typed: true
# frozen_string_literal: true

module ApiAuthentication
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  requires_ancestor { ActionController::Base }

  # == Errors
  class NotAuthenticated < StandardError
    def initialize(message = "Not authenticated")
      super
    end
  end

  private

  # == Helpers
  sig { returns(T.nilable(User)) }
  def api_user
    return @_api_user if defined?(@_api_user)

    @_api_user = if (api_token = self.api_token)
      User.find_by(api_token:)
    end
  end

  sig { returns(User) }
  def api_user!
    api_user or raise NotAuthenticated
  end

  sig { returns(T.nilable(String)) }
  def api_token
    return @_api_token if defined?(@_api_token)

    @_api_token = request.headers["Authorization"]&.split(" ")&.last
  end
end
