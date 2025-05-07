# typed: true
# frozen_string_literal: true

class FriendsController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world/friends
  def index
    current_user = authenticate_user!
    respond_to do |format|
      format.html do
        render(inertia: "FriendsPage")
      end
      format.json do
        friends = current_user.friends.reverse_chronological
        notifiable_friend_ids = PushRegistration
          .where(owner: friends)
          .pluck(:owner_id)
          .to_set
        notifiable_friends = friends.map do |friend|
          notifiable = notifiable_friend_ids.include?(friend.id)
          NotifiableFriend.new(friend:, notifiable:)
        end
        render(json: {
          friends: NotifiableFriendSerializer.many(notifiable_friends),
        })
      end
    end
  end

  # POST /friends
  def create
    current_user = authenticate_user!
    friend_params = params.expect(friend: %i[emoji name phone_number])
    friend = current_user.friends.build(**friend_params)
    friend.join_request = current_user
      .join_requests
      .find_by({ phone_number: friend.phone_number })
    if friend.save
      render(json: { friend: FriendSerializer.one(friend) })
    else
      render(
        json: { errors: friend.form_errors },
        status: :unprocessable_entity,
      )
    end
  end

  # PUT /friends/:id
  def update
    friend = find_friend
    authorize!(friend)
    friend_params = params.expect(friend: %i[emoji name])
    if friend.update(friend_params)
      render(json: { friend: FriendSerializer.one(friend) })
    else
      render(
        json: { errors: friend.form_errors },
        status: :unprocessable_entity,
      )
    end
  end

  # POST /friends/:id/pause
  def pause
    friend = find_friend
    authorize!(friend)
    if friend.update(paused_since: Time.current)
      render(json: { friend: FriendSerializer.one(friend) })
    else
      render(
        json: { errors: friend.form_errors },
        status: :unprocessable_entity,
      )
    end
  end

  # POST /friends/:id/unpause
  def unpause
    friend = find_friend
    authorize!(friend)
    if friend.update(paused_since: nil)
      render(json: { friend: FriendSerializer.one(friend) })
    else
      render(
        json: { errors: friend.form_errors },
        status: :unprocessable_entity,
      )
    end
  end

  # DELETE /friends/:id
  def destroy
    friend_id = T.let(params.fetch(:id), String)
    friend = Friend.find(friend_id)
    authorize!(friend)
    friend.destroy!
    render(json: {})
  end

  private

  # == Helpers
  sig { returns(Friend) }
  def find_friend
    friend_id = params[:id] or
      raise ActionController::ParameterMissing, "Missing friend ID"
    Friend.find(friend_id)
  end
end
