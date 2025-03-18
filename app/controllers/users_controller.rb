# typed: true
# frozen_string_literal: true

class UsersController < ApplicationController
  # == Filters
  before_action :authenticate_user!, only: :update
  before_action :authenticate_friend!, only: :manifest

  # == Actions
  # GET /@:handle
  def show
    show_instructions = T.let(params[:show_instructions].truthy?, T::Boolean)
    handle = T.let(params.fetch(:handle), String)
    user = User.friendly.find(handle)
    page_icon_blob = user.page_icon_blob!
    favicon_variant =
      page_icon_blob.variant(resize_to_fill: [48, 48], format: "png")
    favicon_image_variant =
      page_icon_blob.variant(resize_to_fill: [96, 96], format: "png")
    apple_touch_icon_variant =
      page_icon_blob.variant(resize_to_fill: [180, 180], format: "png")
    current_friend = if (access_token = params[:friend_token])
      user.friends.find_by(access_token:)
    end
    reply_phone_number = if current_friend
      user.phone_number
    end
    render(inertia: "UserPage", props: {
      user: UserSerializer.one(user),
      "currentFriend" => FriendSerializer.one_if(current_friend),
      "replyPhoneNumber" => reply_phone_number,
      "showInstructions" => show_instructions,
      "faviconSrc" => rails_representation_path(favicon_variant),
      "faviconImageSrc" => rails_representation_path(favicon_image_variant),
      "appleTouchIconSrc" =>
        rails_representation_path(apple_touch_icon_variant),
    })
  end

  # GET /users/1/manifest.webmanifest?friend_token=...
  def manifest
    user_id = T.let(params.fetch(:id), String)
    user = User.find(user_id)
    current_friend = authenticate_friend!
    render(
      json: {
        name: "#{user.name}'s smaller world",
        short_name: user.name,
        description: "life updates, personal invitations, poems, and more!",
        icons: manifest_icons(user),
        display: "standalone",
        start_url: user_page_path(
          user,
          friend_token: current_friend.access_token,
        ),
        scope: user_page_path(user),
      },
      content_type: "application/manifest+json",
    )
  end

  # PUT /user
  def update
    raise NotImplementedError, "Not implemented"
  end

  private

  sig { params(user: User).returns(T::Array[T.untyped]) }
  def manifest_icons(user)
    icon_blob = user.page_icon_blob!
    width, height = blob_dimensions(icon_blob)
    smallest_dimension = [width, height].min
    if smallest_dimension >= 192
      [192, 384, 512, 1024].filter_map do |size|
        next if size > smallest_dimension

        icon_variant = icon_blob.variant(
          resize_to_fill: [size, size],
          format: "png",
        )
        type = Mime::Type.lookup_by_extension(icon_variant.variation.format)
        {
          src: rails_representation_path(icon_variant),
          sizes: "#{size}x#{size}",
          type: type.to_s,
          purpose: "any",
        }
      end
    else
      icon_variant = icon_blob.variant(
        resize_to_fill: [192, 192],
        format: "png",
      )
      type = Mime::Type.lookup_by_extension(icon_variant.variation.format)
      [
        {
          src: rails_representation_path(icon_variant),
          sizes: "192x192",
          type: type.to_s,
          purpose: "any",
        },
      ]
    end
  end

  sig { params(blob: ActiveStorage::Blob).returns([Integer, Integer]) }
  def blob_dimensions(blob)
    blob.metadata.fetch_values("width", "height")
  end
end
