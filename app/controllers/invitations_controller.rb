# typed: true
# frozen_string_literal: true

class InvitationsController < ApplicationController
  # GET /invitations/:id
  def show
    invitation = maybe_find_invitation(
      scope: Invitation.includes(:user, :friend),
    )
    if invitation
      user = invitation.user!
      featured_post = user.posts.visible_to_friends.chronological.last
      friend = invitation.friend
      autofill_phone_number = friend&.phone_number || current_user&.phone_number
      render(inertia: "InvitationPage", props: {
        user: UserProfileSerializer.one(user),
        invitation: InvitationSerializer.one(invitation),
        friend: FriendProfileSerializer.one_if(friend),
        "featuredPost" => PostSerializer.one_if(featured_post),
        "existingFriend" => FriendProfileSerializer.one_if(friend),
        "autofillPhoneNumber" => autofill_phone_number,
      })
    else
      render(inertia: "InvalidInvitationPage")
    end
  end

  # POST /invitations/:id/accept
  def accept
    invitation = find_invitation
    user = invitation.user!
    friend_params = params.expect(friend: [:phone_number])
    friend = user.friends.find_or_initialize_by(invitation:) do |f|
      f.emoji = invitation.invitee_emoji
      f.name = invitation.invitee_name
      f.offered_activity_ids = invitation.offered_activity_ids
    end
    friend.attributes = friend_params
    if friend.save
      # friend.send_installation_message!
      render(json: {
        "friendAccessToken" => friend.access_token,
      })
    else
      render(
        json: { errors: friend.form_errors },
        status: :unprocessable_entity,
      )
    end
  end

  private

  # == Helpers
  sig { params(scope: Invitation::PrivateRelation).returns(Invitation) }
  def find_invitation(scope: Invitation.all)
    scope.find(params.fetch(:id))
  end

  sig do
    params(scope: Invitation::PrivateRelation).returns(T.nilable(Invitation))
  end
  def maybe_find_invitation(scope: Invitation.all)
    scope.find_by(id: params.fetch(:id))
  end
end
