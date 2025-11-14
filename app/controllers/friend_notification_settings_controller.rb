# typed: true
# frozen_string_literal: true

class FriendNotificationSettingsController < ApplicationController
  # == Filters ==

  before_action :authenticate_friend!

  # == Actions ==

  # GET /friend_notification_settings?friend_token=...
  def show
    respond_to do |format|
      format.json do
        current_friend = authenticate_friend!
        render(json: {
          "notificationSettings" =>
            FriendNotificationSettingsSerializer.one(current_friend),
        })
      end
    end
  end

  # PUT /friend_notification_settings?friend_token=...
  def update
    respond_to do |format|
      format.json do
        current_friend = authenticate_friend!
        notification_settings_params = params
          .expect(notification_settings: [subscribed_post_types: []])
        if current_friend.update(notification_settings_params)
          render(json: {
            "notificationSettings" =>
              FriendNotificationSettingsSerializer.one(current_friend),
          })
        else
          render(
            json: { errors: current_friend.form_errors },
            status: :unprocessable_entity,
          )
        end
      end
    end
  end
end
