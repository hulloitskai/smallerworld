# typed: true
# frozen_string_literal: true

class WorldFriendsController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world/friends
  def index
    current_user = authenticate_user!
    respond_to do |format|
      format.html do
        pending_invitations = current_user.invitations.pending.count
        render(inertia: "WorldFriendsPage", props: {
          "pendingInvitationsCount": pending_invitations,
        })
      end
      format.json do
        friends = current_user.friends
          .with_active_activity_coupons
          .with_push_registrations
          .reverse_chronological
        render(json: {
          friends: WorldFriendSerializer.many(friends),
        })
      end
    end
  end

  # PUT /world/friends/:id
  def update
    friend = load_friend
    authorize!(friend)
    friend_params = params.expect(friend: %i[emoji name])
    if friend.update(friend_params)
      render(json: {
        friend: FriendSerializer.one(friend),
      })
    else
      render(
        json: {
          errors: friend.form_errors,
        },
        status: :unprocessable_entity,
      )
    end
  end

  # POST /world/friends/:id/pause
  def pause
    friend = load_friend
    authorize!(friend)
    if friend.update(paused_since: Time.current)
      render(json: {
        friend: FriendSerializer.one(friend),
      })
    else
      render(
        json: { errors: friend.form_errors },
        status: :unprocessable_entity,
      )
    end
  end

  # POST /world/friends/:id/unpause
  def unpause
    friend = load_friend
    authorize!(friend)
    if friend.update(paused_since: nil)
      render(json: {
        friend: FriendSerializer.one(friend),
      })
    else
      render(
        json: {
          errors: friend.form_errors,
        },
        status: :unprocessable_entity,
      )
    end
  end

  # DELETE /world/friends/:id
  def destroy
    friend = load_friend
    authorize!(friend)
    friend.destroy!
    render(json: {})
  end

  # GET /world/friends/:id/invite_url
  def invite_url
    friend = load_friend
    authorize!(friend)
    invitation = friend.invitation || scoped do
      created_at = friend.created_at
      friend.transaction do |invitation|
        invitation = friend.create_invitation!(
          user: friend.user!,
          invitee_name: friend.name,
          invitee_emoji: friend.emoji,
          created_at:,
          updated_at: created_at,
          join_request_id: friend.deprecated_join_request_id,
        )
        friend.save!
        invitation
      end
    end
    invite_url = ShortlinkService.url_helpers.invitation_url(invitation)
    render(json: {
      "inviteUrl" => invite_url,
    })
  end

  private

  # == Helpers
  sig { params(scope: Friend::PrivateRelation).returns(Friend) }
  def load_friend(scope: Friend.all)
    scope.find(params.fetch(:id))
  end
end
