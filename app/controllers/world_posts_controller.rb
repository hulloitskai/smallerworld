# typed: true
# frozen_string_literal: true

class WorldPostsController < ApplicationController
  # == Constants
  POSTS_PER_PAGE = 5

  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world/posts?type=...&q=...
  def index
    current_user = authenticate_user!
    posts = authorized_scope(current_user.posts)
      .with_images
      .with_quoted_post_and_images
      .with_encouragement
    if (type = params[:type])
      posts = posts.where(type:)
    end
    ordering = { created_at: :desc, id: :asc }
    pagy, paginated_posts = if (query = params[:q])
      posts = posts.search(query).order(ordering)
      pagy(posts, limit: POSTS_PER_PAGE)
    else
      posts = posts.order(ordering)
      pagy_keyset(posts, limit: POSTS_PER_PAGE)
    end
    render(json: {
      posts: WorldPostSerializer.many(paginated_posts),
      pagination: {
        next: pagy.next,
      },
    })
  end

  # GET /world/posts/pinned
  def pinned
    current_user = authenticate_user!
    posts = authorized_scope(current_user.posts.currently_pinned)
      .with_images
      .with_quoted_post_and_images
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
      :quiet,
      :text_blast,
      images: [],
      hidden_from_ids: [],
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
    post = load_post(scope: Post.with_images.with_quoted_post_and_images)
    authorize!(post)
    post_params = params.expect(post: [
      :title,
      :body_html,
      :emoji,
      :visibility,
      :pinned_until,
      images: [],
      hidden_from_ids: [],
    ])
    if post.update(post_params)
      render(json: { post: WorldPostSerializer.one(post) })
    else
      render(
        json: { errors: post.form_errors },
        status: :unprocessable_entity,
      )
    end
  end

  # DELETE /world/posts/:id
  def destroy
    post = load_post(scope: Post.with_images)
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

  private

  sig { params(scope: Post::PrivateRelation).returns(Post) }
  def load_post(scope: Post.all)
    scope.find(params.fetch(:id))
  end
end
