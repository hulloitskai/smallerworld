# typed: true
# frozen_string_literal: true

class WorldPostsController < ApplicationController
  # == Constants
  POSTS_PER_PAGE = 5

  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world/posts?type=...&date=...&q=...
  def index
    current_user = authenticate_user!
    scope = authorized_scope(current_user.posts)
      .with_attached_images
      .with_quoted_post_and_attached_images
      .with_encouragement
    if (type = params[:type])
      raise "Invalid type: #{type}" unless type.is_a?(String)

      scope = scope.where(type:)
    end
    if (value = params[:date])
      raise "Invalid date: #{value}" unless value.is_a?(String)

      time = value.to_time or raise "Invalid date: #{value}"
      scope = scope.where(created_at: time.all_day)
    end
    ordering = { created_at: :desc, id: :asc }
    pagy, posts = if (query = params[:q])
      scope = scope.search(query).order(ordering)
      pagy(scope, limit: POSTS_PER_PAGE)
    else
      scope = scope.order(ordering)
      pagy_keyset(scope, limit: POSTS_PER_PAGE)
    end
    render(json: {
      posts: WorldPostSerializer.many(posts),
      pagination: {
        next: pagy.next,
      },
    })
  end

  # GET /world/posts/pinned
  def pinned
    current_user = authenticate_user!
    posts = authorized_scope(current_user.posts.currently_pinned)
      .with_attached_images
      .with_quoted_post_and_attached_images
      .with_encouragement
      .order(pinned_until: :asc, created_at: :asc)
    render(json: {
      posts: WorldPostSerializer.many(posts),
    })
  end

  # GET /world/posts/:id/stats
  def stats
    post = load_post
    authorize!(post, to: :manage?)
    render(json: {
      "notifiedFriends" => post.notified_friends.count,
      "viewers" => post.viewers.count,
      "repliers" => post.reply_receipts.distinct.count(:friend_id),
    })
  end

  # GET /world/posts/:id/viewers
  def viewers
    post = load_post
    authorize!(post)
    render(json: {
      viewers: FriendProfileSerializer.many(post.viewers),
    })
  end

  # GET /world/posts/:id/audience
  def audience
    post = load_post
    authorize!(post)
    notified_ids = post.notifications.to_friends.pluck(:recipient_id) +
      post.text_blasts.pluck(:friend_id)
    render(json: {
      "hiddenFromIds" => post.hidden_from_ids,
      "notifiedIds" => notified_ids,
      "visibleToIds" => post.visible_to_ids,
    })
  end

  # POST /world/posts
  def create
    current_user = authenticate_user!
    post_params = params.expect(post: [
      :type,
      :title,
      :body_html,
      :emoji,
      :visibility,
      :pinned_until,
      :encouragement_id,
      :quoted_post_id,
      :spotify_track_id,
      images: [],
      friend_ids_to_notify: [],
      hidden_from_ids: [],
      visible_to_ids: [],
    ])
    post = current_user.posts.build(**post_params)
    if post.save
      render(json: { post: WorldPostSerializer.one(post) }, status: :created)
    else
      render(
        json: { errors: post.form_errors },
        status: :unprocessable_entity,
      )
    end
  end

  # PUT /world/posts/:id
  def update
    post = load_post(
      scope: Post.with_attached_images.with_quoted_post_and_attached_images,
    )
    authorize!(post)
    post_params = params.expect(post: [
      :title,
      :body_html,
      :emoji,
      :visibility,
      :pinned_until,
      :encouragement_id,
      :spotify_track_id,
      images: [],
      friend_ids_to_notify: [],
      hidden_from_ids: [],
      visible_to_ids: [],
    ])
    if post.update(post_params)
      render(json: {
        post: WorldPostSerializer.one(post),
      })
    else
      render(
        json: { errors: post.form_errors },
        status: :unprocessable_entity,
      )
    end
  end

  # DELETE /world/posts/:id
  def destroy
    post = load_post(
      scope: Post.with_attached_images.with_quoted_post_and_attached_images,
    )
    authorize!(post)
    if post.destroy
      render(json: {})
    else
      render(
        json: { errors: post.errors.full_messages },
        status: :unprocessable_entity,
      )
    end
  end

  # POST /world/posts/:id/share
  def share
    current_user = authenticate_user!
    post = load_post
    authorize!(post)
    share = post.shares.find_or_create_by!(sharer: current_user)
    render(json: {
      share: PostShareSerializer.one(share),
    })
  end

  private

  sig { params(scope: Post::PrivateRelation).returns(Post) }
  def load_post(scope: Post.all)
    scope.find(params.fetch(:id))
  end
end
