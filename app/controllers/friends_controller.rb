# typed: true
# frozen_string_literal: true

class FriendsController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # DELETE /friends/:id
  def destroy
    friend = load_friend
    authorize!(friend)
    friend.destroy!
    render(json: {})
  end

  # POST /friends/:id/invite_token
  def invite_token
    friend = load_friend
    authorize!(friend)
    token = friend.generate_invite_token
    render(json: {
      "inviteToken" => token,
    })
  end

  private

  # == Helpers
  sig { params(scope: Friend::PrivateRelation).returns(Friend) }
  def load_friend(scope: Friend.all)
    scope.find(params.fetch(:id))
  end
end
