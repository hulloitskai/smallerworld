# typed: true
# frozen_string_literal: true

class WorldInvitationsController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world/invitations
  def index
    current_user = authenticate_user!
    respond_to do |format|
      format.html do
        render(inertia: "WorldInvitationsPage")
      end
      format.json do
        pending_invitations = current_user.invitations
          .pending
          .reverse_chronological
        render(json: {
          "pendingInvitations" =>
            WorldInvitationSerializer.many(pending_invitations),
        })
      end
    end
  end

  # POST /world/invitations
  def create
    current_user = authenticate_user!
    invitation_params = params.expect(invitation: [
      :join_request_id,
      :invitee_name,
      :invitee_emoji,
      offered_activity_ids: [],
    ])
    invitation = current_user.invitations.build(**invitation_params)
    if invitation.save
      render(
        json: {
          invitation: WorldInvitationSerializer.one(invitation),
        },
        status: :created,
      )
    else
      render(
        json: {
          errors: invitation.form_errors,
        },
        status: :unprocessable_entity,
      )
    end
  end

  # PUT/PATCH /world/invitations/:id
  def update
    invitation = find_invitation
    authorize!(invitation)
    invitation_params = params.expect(invitation: [
      :invitee_name,
      :invitee_emoji,
      offered_activity_ids: [],
    ])
    if invitation.update(**invitation_params)
      render(
        json: {
          invitation: WorldInvitationSerializer.one(invitation),
        },
      )
    else
      render(
        json: {
          errors: invitation.form_errors,
        },
        status: :unprocessable_entity,
      )
    end
  end

  # DELETE /world/invitations/:id
  def destroy
    invitation = find_invitation
    authorize!(invitation)
    invitation.destroy!
    render(json: {})
  end

  private

  # == Helpers
  sig { returns(Invitation) }
  def find_invitation
    Invitation.find(params.fetch(:id))
  end
end
