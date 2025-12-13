# typed: true
# frozen_string_literal: true

class InvitationsController < ApplicationController
  # GET /invitations/:id
  def show
    respond_to do |format|
      format.html do
        invitation = find_invitation(scope: Invitation.includes(
          :world,
          :friend,
        ))
        if invitation
          world = invitation.world!
          featured_post = world.posts
            .visible_to_friends
            .chronological
            .last
          friend = invitation.friend
          autofill_phone_number =
            friend&.phone_number || current_user&.phone_number
          render(inertia: "InvitationPage", world_theme: world.theme, props: {
            world: WorldSerializer.one(world),
            invitation: InvitationSerializer.one(invitation),
            friend: FriendProfileSerializer.one_if(friend),
            "featuredPost" => PostSerializer.one_if(featured_post),
            "existingFriend" => FriendProfileSerializer.one_if(friend),
            "autofillPhoneNumber" => autofill_phone_number
          })
        else
          render(inertia: "InvalidInvitationPage")
        end
      end
    end
  end

  # POST /invitations/:id/accept
  def accept
    respond_to do |format|
      format.json do
        invitation = find_invitation!
        friend_params = params.expect(friend: %i[phone_number time_zone])
        friend = invitation.world_friends
          .find_or_initialize_by(invitation:) do |f|
            f.world = invitation.world!
            f.emoji = invitation.invitee_emoji
            f.name = invitation.invitee_name
            f.offered_activity_ids = invitation.offered_activity_ids
          end
        friend.attributes = friend_params
        if friend.save
          # friend.send_installation_message!
          render(json: {
            "friendAccessToken" => friend.access_token
          })
        else
          render(
            json: { errors: friend.form_errors },
            status: :unprocessable_content,
          )
        end
      end
    end
  end

  private

  # == Helpers ==

  sig { params(scope: Invitation::PrivateRelation).returns(Invitation) }
  def find_invitation!(scope: Invitation.all)
    scope.find(params.fetch(:id))
  end

  sig do
    params(scope: Invitation::PrivateRelation).returns(T.nilable(Invitation))
  end
  def find_invitation(scope: Invitation.all)
    scope.find_by(id: params.fetch(:id))
  end
end
