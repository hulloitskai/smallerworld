# typed: true
# frozen_string_literal: true

class PostsController < ApplicationController
  # == Constants
  POSTS_PER_PAGE = 5

  # == Filters
  before_action :authenticate_user!, except: %i[share mark_seen mark_replied]
  before_action :authenticate_friend!, only: %i[share mark_seen mark_replied]

  # == Actions
  # GET /posts?type=...&q=...
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

  # GET /posts/pinned
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

  # GET /posts/:id/stats
  def stats
    post = load_post
    authorize!(post, to: :manage?)
    render(json: {
      "notifiedFriends" => post.notified_friends.count,
      "viewers" => post.viewers.count,
      "repliers" => post.reply_receipts.distinct.count(:friend_id),
    })
  end

  # POST /posts
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

  # PUT /posts/:id
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

  # POST /posts/:id/share?friend_token=...
  def share
    current_friend = authenticate_friend!
    post = load_post
    authorize!(post)
    share = post.shares.find_or_create_by!(sharer: current_friend)
    render(json: {
      share: PostShareSerializer.one(share),
    })
  end

  # POST /posts/:id/mark_seen
  def mark_seen
    current_friend = authenticate_friend!
    post = load_post
    authorize!(post)
    post.views.find_or_create_by!(friend: current_friend)
    render(json: { "authorId" => post.author_id })
  end

  # POST /posts/:id/mark_replied
  def mark_replied
    current_friend = authenticate_friend!
    post = load_post
    authorize!(post)
    post.reply_receipts.create!(friend: current_friend)
    render(json: { "authorId" => post.author_id })
  end

  # DELETE /posts/:id
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
