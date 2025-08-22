# typed: true
# frozen_string_literal: true

class InvitationsController < ApplicationController
  # GET /invitations/:id
  def show
    invitation = find_invitation(scope: Invitation.includes(:user, :friend))
    user = invitation.user!
    featured_post = user.posts.chronological.last
    render(inertia: "InvitationPage", props: {
      user: UserSerializer.one(user),
      invitation: InvitationSerializer.one(invitation),
      "invitationAccepted" => !!invitation.friend,
      "featuredPost" => PostSerializer.one_if(featured_post),
    })
  end

  # POST /invitations/:id/accept
  def accept
    invitation = find_invitation
    user = invitation.user!
    friend_params = params.expect(friend: [:phone_number])
    friend = user.friends.build(
      invitation:,
      emoji: invitation.invitee_emoji,
      name: invitation.invitee_name,
      offered_activity_ids: invitation.offered_activity_ids,
    )
    if friend.update(friend_params)
      render(json: {})
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
end
