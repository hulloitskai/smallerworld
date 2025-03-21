# typed: true
# frozen_string_literal: true

class UsersController < ApplicationController
  # == Actions
  # GET /@:handle
  def show
    handle = T.let(params.fetch(:handle), String)
    user = User.friendly.find(handle)
    reply_phone_number = user.phone_number if current_friend
    page_icon_blob = user.page_icon_blob!
    favicon_variant =
      page_icon_blob.variant(resize_to_fill: [48, 48], format: "png")
    favicon_image_variant =
      page_icon_blob.variant(resize_to_fill: [96, 96], format: "png")
    apple_touch_icon_variant =
      page_icon_blob.variant(resize_to_fill: [180, 180], format: "png")
    render(inertia: "UserPage", props: {
      user: UserSerializer.one(user),
      "replyPhoneNumber" => reply_phone_number,
      "faviconSrc" => rails_representation_path(favicon_variant),
      "faviconImageSrc" => rails_representation_path(favicon_image_variant),
      "appleTouchIconSrc" =>
        rails_representation_path(apple_touch_icon_variant),
    })
  end

  # GET /users/:id/manifest.webmanifest?friend_token=...
  def manifest
    current_friend = self.current_friend
    user_id = T.let(params.fetch(:id), String)
    user = User.find(user_id)
    name = current_friend ? "#{user.name}'s world" : "smaller world"
    short_name = current_friend ? user.name : "smaller world"
    description = if current_friend
      "life updates, personal invitations, poems, and more!"
    else
      "a smaller world for you and your friends :)"
    end
    start_url = if current_friend
      user_page_path(user, friend_token: current_friend.access_token)
    else
      world_path
    end
    scope = current_friend ? user_page_path(user) : world_path
    render(
      json: {
        name:,
        short_name:,
        description:,
        icons: manifest_icons(user),
        display: "standalone",
        start_url:,
        scope:,
      },
      content_type: "application/manifest+json",
    )
  end

  # GET /users/:id/posts
  def posts
    user_id = T.let(params.fetch(:id), String)
    user = User.find(user_id)
    posts = user.posts
    unless (friend = current_friend) && friend.chosen_family?
      posts = posts.visible_to_friends
    end
    pagy, paginated_posts = pagy_keyset(
      posts.order(created_at: :desc, id: :asc),
    )
    unless current_friend
      paginated_posts.map! do |post|
        if post.visibility.public?
          post
        else
          MaskedPost.new(post:)
        end
      end
    end
    render(json: {
      posts: PostSerializer.many(paginated_posts),
      pagination: {
        next: pagy.next,
      },
    })
  end

  # POST /users/:id/request_invitation
  def request_invitation
    user_id = T.let(params.fetch(:id), String)
    user = User.find(user_id)
    join_request_params = params.expect(join_request: %i[name phone_number])
    phone_number = join_request_params.delete(:phone_number)
    join_request = user.join_requests.find_or_initialize_by(phone_number:)
    if join_request.persisted? &&
        user.friends.exists?(join_request_id: join_request.id)
      raise "You have already been invited."
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
