# typed: true
# frozen_string_literal: true

class InvitationsController < ApplicationController
  # GET /invitations/:invite_token
  def show
    friend = find_friend_by_invite_token
    user = friend.user!
    featured_post = user.posts.chronological.last
    render(inertia: "InvitationPage", props: {
      user: UserSerializer.one(user),
      friend: FriendProfileSerializer.one(friend),
      "inviteToken" => friend.generate_invite_token,
      "invitationAccepted" => friend.phone_number?,
      "featuredPost" => PostSerializer.one_if(featured_post),
    })
  end

  # POST /invitations/:invite_token/accept
  def accept
    friend = find_friend_by_invite_token
    if friend.phone_number?
      raise "Invitation already accepted"
    end

    friend_params = params.expect(friend: [:phone_number])
    if friend.update(**friend_params)
      render(json: {})
    else
      render(
        json: {
          errors: friend.form_errors,
        },
        status: :unprocessable_entity,
      )
    end
  end

  private

  # == Helpers
  sig { returns(Friend) }
  def find_friend_by_invite_token
    invite_token = params.fetch(:invite_token)
    Friend.find_by_invite_token!(invite_token)
  end
end
