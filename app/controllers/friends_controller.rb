# typed: true
# frozen_string_literal: true

class FriendsController < ApplicationController
  # == Filters ==

  before_action :authenticate_friend!

  # == Actions ==

  # GET /friends/notification_settings?friend_token=...
  def notification_settings
    respond_to do |format|
      format.json do
        current_friend = authenticate_friend!
        render(json: {
          "notificationSettings" =>
            FriendNotificationSettingsSerializer.one(current_friend)
        })
      end
    end
  end

  # PUT /friends?friend_token=...
  def update
    respond_to do |format|
      format.json do
        current_friend = authenticate_friend!
        friend_params = params.expect(friend: [ :subscribed_post_types ])
        if current_friend.update(friend_params)
          render(json: {
            "notificationSettings" =>
              FriendNotificationSettingsSerializer.one(current_friend)
          })
        else
          render(
            json: { errors: current_friend.form_errors },
            status: :unprocessable_content,
          )
        end
      end
    end
  end
end
