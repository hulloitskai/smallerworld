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
        friends = current_user.friends.chronological
        render(json: {
          friends: FriendSerializer.many(friends),
        })
      end
    end
  end

  # POST /friends
  def create
    current_user = authenticate_user!
    friend_params = T.let(
      params.expect(friend: %i[emoji name]),
      ActionController::Parameters,
    )
    friend = current_user.friends.build(friend_params)
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
    current_user = authenticate_user!
    friend = current_user.friends.find(params.fetch(:id))
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
end
