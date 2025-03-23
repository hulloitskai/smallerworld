# typed: true
# frozen_string_literal: true

class FriendsController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /friends
  def index
    respond_to do |format|
      format.html { render(inertia: "FriendsPage") }
      format.json do
        current_user = authenticate_user!
        friends = current_user.friends.reverse_chronological
        notifiable_friend_ids = PushRegistration
          .where(owner: friends)
          .pluck(:owner_id)
          .to_set
        friend_views = friends.map do |friend|
          notifiable = notifiable_friend_ids.include?(friend.id)
          FriendView.new(friend:, notifiable:)
        end
        render(json: {
          friends: FriendViewSerializer.many(friend_views),
        })
      end
    end
  end

  # POST /friends
  def create
    current_user = authenticate_user!
    friend_params = T.let(
      params.expect(friend: %i[emoji name phone_number]),
      ActionController::Parameters,
    )
    friend = current_user.friends.build(friend_params)
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
    friend_id = T.let(params.fetch(:id), String)
    friend = Friend.find(friend_id)
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
    friend_id = T.let(params.fetch(:id), String)
    friend = Friend.find(friend_id)
    authorize!(friend)
    friend.paused_since = Time.current
    if friend.save
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
end
