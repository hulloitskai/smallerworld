# typed: true
# frozen_string_literal: true

module AuthenticatesFriends
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  requires_ancestor { ActionController::Base }

  # == Errors ==

  class MissingAccessToken < StandardError
    def initialize(message = "Missing friend access token")
      super
    end
  end

  included do
    T.bind(self, T.class_of(ActionController::Base))

    # == Configuration ==

    authorize :friend, through: :current_friend

    # == Exception Handling ==

    rescue_from MissingAccessToken, with: :handle_missing_friend_access_token
  end

  private

  # == Helpers ==

  sig { returns(T.nilable(String)) }
  def friend_access_token
    params[:friend_token]
  end

  sig { returns(T.nilable(Friend)) }
  def current_friend
    return @current_friend if defined?(@current_friend)

    @current_friend = if (access_token = friend_access_token)
      Friend.find_by(access_token:)
    end
  end

  sig { returns(Friend) }
  def authenticate_friend!
    current_friend or raise MissingAccessToken
  end

  # == Rescue Handlers ==

  sig { params(error: MissingAccessToken).void }
  def handle_missing_friend_access_token(error)
    render(json: { error: error.message }, status: :unauthorized)
  end
end
