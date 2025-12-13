# typed: true
# frozen_string_literal: true

module Users::Worlds
  class InvitationsController < ApplicationController
    # == Actions ==

    # GET /world/invitations
    def index
      respond_to do |format|
        format.html do
          world = current_world or next redirect_to(
            new_registration_path,
            notice: "create a world to continue",
          )
          render(
            inertia: "UserWorldInvitationsPage",
            world_theme: world.theme,
            props: {
              world: WorldSerializer.one(world),
              "hasFriends" => world.friends.exists?
            },
          )
        end
        format.json do
          world = current_world!
          pending_invitations = world.invitations
            .pending
            .reverse_chronological
          render(json: {
            world: WorldSerializer.one(world),
            "pendingInvitations" =>
              UserWorldInvitationSerializer.many(pending_invitations)
          })
        end
      end
    end

    # POST /world/invitations
    def create
      respond_to do |format|
        format.json do
          world = current_world!
          invitation_params = params.expect(invitation: [
            :join_request_id,
            :invitee_name,
            :invitee_emoji,
            offered_activity_ids: []
          ])
          invitation = world.invitations.build(**invitation_params)
          if invitation.save
            render(
              json: {
                invitation: UserWorldInvitationSerializer.one(invitation)
              },
              status: :created,
            )
          else
            render(
              json: {
                errors: invitation.form_errors
              },
              status: :unprocessable_content,
            )
          end
        end
      end
    end

    # PUT/PATCH /world/invitations/:id
    def update
      respond_to do |format|
        format.json do
          invitation = find_invitation!
          authorize!(invitation)
          invitation_params = params.expect(invitation: [
            :invitee_name,
            :invitee_emoji,
            offered_activity_ids: []
          ])
          if invitation.update(**invitation_params)
            render(
              json: {
                invitation: UserWorldInvitationSerializer.one(invitation)
              },
            )
          else
            render(
              json: {
                errors: invitation.form_errors
              },
              status: :unprocessable_content,
            )
          end
        end
      end
    end

    # DELETE /world/invitations/:id
    def destroy
      respond_to do |format|
        format.json do
          invitation = find_invitation!
          authorize!(invitation)
          invitation.destroy!
          render(json: {})
        end
      end
    end

    private

    # == Helpers ==

    sig { returns(Invitation) }
    def find_invitation!
      Invitation.find(params.fetch(:id))
    end
  end
end
