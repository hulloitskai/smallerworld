# typed: true
# frozen_string_literal: true

module AuthenticatesFriends
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  requires_ancestor { ActionController::Base }

  included do
    T.bind(self, T.class_of(ActionController::Base))

    authorize :friend, through: :current_friend
  end

  private

  # == Helpers
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
    current_friend or raise "Invalid friend access token"
  end
end
