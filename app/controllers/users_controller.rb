# typed: true
# frozen_string_literal: true

class UsersController < ApplicationController
  # before_action :authenticate_user!, only: :joined

  # == Actions
  # GET /@:handle
  def show
    handle = T.let(params.fetch(:handle), String)
    user = User.friendly.find(handle)
    page_icon_blob = user.page_icon_blob!
    favicon_variant =
      page_icon_blob.variant(resize_to_fill: [48, 48], format: "png")
    favicon_image_variant =
      page_icon_blob.variant(resize_to_fill: [96, 96], format: "png")
    apple_touch_icon_variant =
      page_icon_blob.variant(resize_to_fill: [180, 180], format: "png")
    if (friend = current_friend)
      reply_phone_number = user.phone_number
      last_sent_encouragement = friend.latest_visible_encouragement
    end
    render(inertia: "UserPage", props: {
      user: UserSerializer.one(user),
      "faviconSrc" => rails_representation_path(favicon_variant),
      "faviconImageSrc" => rails_representation_path(favicon_image_variant),
      "appleTouchIconSrc" =>
        rails_representation_path(apple_touch_icon_variant),
      "replyPhoneNumber" => reply_phone_number,
      "lastSentEncouragement" => EncouragementSerializer.one_if(
        last_sent_encouragement,
      ),
    })
  end

  # GET /@:handle/join
  def join
    handle = T.let(params.fetch(:handle), String)
    redirect_to(user_path(handle, intent: "join"))
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
      user_path(user, friend_token: current_friend.access_token)
    else
      world_path
    end
    scope = current_friend ? user_path(user) : world_path
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
    posts = user.posts.includes(:image_blob)
    unless (friend = current_friend) && friend.chosen_family?
      posts = posts.visible_to_friends
    end
    pagy, paginated_posts = pagy_keyset(
      posts.order(created_at: :desc, id: :asc),
    )
    unless current_friend
      paginated_posts.map! do |post|
        post.visibility == :public ? post : MaskedPost.new(post:)
      end
    end
    post_ids = paginated_posts.map(&:id)
    replied_post_ids = if (friend = current_friend)
      PostReplyReceipt
        .where(post_id: post_ids, friend:)
        .pluck(:post_id)
        .to_set
    end
    repliers_by_post_id = PostReplyReceipt
      .where(post_id: post_ids)
      .group(:post_id)
      .select(:post_id, "COUNT(DISTINCT friend_id) AS repliers")
      .map do |reply_receipt|
        repliers = T.let(reply_receipt[:repliers], Integer)
        [reply_receipt.post_id, repliers]
      end
      .to_h
    post_views = paginated_posts.map do |post|
      replied = replied_post_ids&.include?(post.id)
      repliers = repliers_by_post_id.fetch(post.id, 0)
      PostView.new(post:, replied:, repliers:)
    end
    render(json: {
      posts: PostViewSerializer.many(post_views),
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
    blob.analyze unless blob.analyzed?
    blob.metadata.fetch_values("width", "height")
  end
end
