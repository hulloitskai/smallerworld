# typed: true
# frozen_string_literal: true

class UserManifestsController < ApplicationController
  include GeneratesManifest

  # == Filters ==

  before_action :authenticate_friend!

  # == Actions ==

  # GET /users/:id/manifest.webmanifest?friend_token=...&icon_type=(generic|user) # rubocop:disable Layout/LineLength
  def manifest
    respond_to do |format|
      format.webmanifest do
        current_friend = authenticate_friend!
        user = find_user(scope: User.with_attached_page_icon)
        icons = if params[:icon_type] == "generic"
          brand_manifest_icons
        else
          user_manifest_icons(user)
        end
        render(
          json: {
            id: user_path(user, friend_token: current_friend.access_token),
            name: "#{user.name}'s world",
            short_name: user.name,
            description: "life updates, personal invitations, poems, and more!",
            icons:,
            display: "standalone",
            start_url: user_path(
              user,
              friend_token: current_friend.access_token,
              trailing_slash: true,
            ),
            scope: user_path(user, trailing_slash: true),
          },
          content_type: "application/manifest+json",
        )
      end
    end
  end

  private

  # == Helpers ==

  sig { params(scope: User::PrivateRelation).returns(User) }
  def find_user(scope: User.all)
    scope.find(params.fetch(:user_id))
  end
end
