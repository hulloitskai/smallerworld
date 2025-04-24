# typed: true
# frozen_string_literal: true

class UsersController < ApplicationController
  include RendersUserFavicons
  include GeneratesManifest

  # == Filters
  before_action :authenticate_friend!, only: :manifest

  # == Actions
  # GET /@:handle?intent=(join|installation_instructions)&manifest_icon_type=(generic|user) # rubocop:disable Layout/LineLength
  def show
    user = find_user
    if (current_user = self.current_user)
      invitation_requested = user
        .join_requests
        .exists?(phone_number: current_user.phone_number)
    end
    if (friend = current_friend)
      reply_phone_number = user.phone_number
      last_sent_encouragement = friend.latest_visible_encouragement
    end
    props = {
      user: UserSerializer.one(user),
      "replyPhoneNumber" => reply_phone_number,
      "lastSentEncouragement" => EncouragementSerializer
        .one_if(last_sent_encouragement),
      "invitationRequested" => invitation_requested,
    }
    unless params[:manifest_icon_type] == "generic"
      props["faviconLinks"] = user_favicon_links(user)
    end
    render(inertia: "UserPage", props:)
  end

  # GET /@:handle/join
  def join
    handle = T.let(params.fetch(:handle), String)
    redirect_to(user_path(handle, intent: "join"))
  end

  # GET /@:handle/manifest.webmanifest?friend_token=...&icon_type=(generic|user)
  def manifest
    current_friend = authenticate_friend!
    user = find_user
    icons =
      if params[:icon_type] == "generic"
        generic_manifest_icons
      else
        user_manifest_icons(user)
      end
    render(
      json: {
        name: "#{user.name}'s world",
        short_name: user.name,
        description: "life updates, personal invitations, poems, and more!",
        icons:,
        display: "standalone",
        start_url: user_path(user, friend_token: current_friend.access_token),
        scope: user_path(user),
      },
      content_type: "application/manifest+json",
    )
  end

  # # GET /users/joined
  # def joined
  #   current_user = authenticate_user!
  #   colocated_friends = current_user.colocated_friends
  #   friend_phone_numbers = current_user.friends
  #     .where(
  #       phone_number: colocated_friends
  #         .references(:user)
  #         .select("users.phone_number"),
  #     )
  #     .pluck(:phone_number)
  #     .to_set
  #   joined_users = colocated_friends.map do |friend|
  #     user = friend.user!
  #     JoinedUser.new(
  #       user:,
  #       friend_access_token: friend.access_token,
  #       friended: friend_phone_numbers.include?(user.phone_number),
  #     )
  #   end
  #   render(json: {
  #     "users" => JoinedUserSerializer.many(joined_users),
  #   })
  # end

  # POST /users/:id/request_invitation
  def request_invitation
    user = find_user
    join_request_params = params.expect(join_request: %i[name phone_number])
    phone_number = join_request_params.delete(:phone_number)
    join_request = user.join_requests.find_or_initialize_by(phone_number:)
    if join_request.persisted? &&
        user.friends.exists?(join_request_id: join_request.id) ||
        user.friends.exists?(phone_number:)
      raise "You have already been invited"
    end

    if join_request.update(join_request_params)
      render(json: {
        "joinRequest" => JoinRequestSerializer.one(join_request),
      })
    else
      render(
        json: { errors: join_request.form_errors },
        status: :unprocessable_entity,
      )
    end
  end

  private

  # == Helpers
  sig { returns(User) }
  def find_user
    id = params[:id] || params[:handle] or
      raise "Missing id or handle"
    User.friendly.find(id)
  end
end
