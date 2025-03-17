# typed: strict
# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    extend T::Sig
    extend T::Helpers

    # == Configuration
    identified_by :current_user, :current_friend

    # == Connection
    sig { void }
    def connect
      self.current_user = find_verified_user
      self.current_friend = find_verified_friend
    end

    private

    # == Helpers
    sig { returns(T.nilable(User)) }
    def find_verified_user
      env["warden"].user
    end

    sig { returns(T.nilable(Friend)) }
    def find_verified_friend
      if (access_token = request.params[:friend_access_token])
        Friend.find_by(access_token:)
      end
    end
  end
end
