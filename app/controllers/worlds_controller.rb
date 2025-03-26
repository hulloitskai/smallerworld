# typed: true
# frozen_string_literal: true

class WorldsController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world
  def show
    current_user = authenticate_user!
    page_icon_blob = current_user.page_icon_blob!
    favicon_variant =
      page_icon_blob.variant(resize_to_fill: [48, 48], format: "png")
    favicon_image_variant =
      page_icon_blob.variant(resize_to_fill: [96, 96], format: "png")
    apple_touch_icon_variant =
      page_icon_blob.variant(resize_to_fill: [180, 180], format: "png")
    friends = current_user.friends
      .reverse_chronological
      .where.associated(:push_registrations)
      .distinct
      .first(3)
    if friends.size < 3
      friends += current_user.friends
        .reverse_chronological
        .where.missing(:push_registrations)
        .distinct
        .first(3 - friends.size)
    end
    pending_join_requests = current_user.join_requests.pending.count
    render(inertia: "WorldPage", props: {
      "faviconSrc" => rails_representation_path(favicon_variant),
      "faviconImageSrc" => rails_representation_path(favicon_image_variant),
      "appleTouchIconSrc" =>
        rails_representation_path(apple_touch_icon_variant),
      friends: FriendInfoSerializer.many(friends),
      "pendingJoinRequests" => pending_join_requests,
    })
  end

  # GET /world/edit
  def edit
    render(inertia: "EditWorldPage")
  end

  # PUT /world
  def update
    user = authenticate_user!
    user_params = T.let(
      params.expect(user: %i[name page_icon theme]),
      ActionController::Parameters,
    )
    if user.update(user_params)
      render(json: { user: UserSerializer.one(user) })
    else
      render(
        json: { errors: user.form_errors },
        status: :unprocessable_entity,
      )
    end
  end
end
