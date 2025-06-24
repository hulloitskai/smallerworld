# typed: true
# frozen_string_literal: true

class PostsController < ApplicationController
  # == Constants
  POSTS_PER_PAGE = 5

  # == Filters
  before_action :authenticate_user!, except: %i[mark_seen mark_replied]
  before_action :authenticate_friend!, only: %i[mark_seen mark_replied]

  # == Actions
  # GET /posts?type=...&q=...
  def index
    current_user = authenticate_user!
    posts = authorized_scope(current_user.posts)
      .includes(images_attachments: :blob)
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
      .includes(images_attachments: :blob)
      .order(pinned_until: :asc, created_at: :asc)
    render(json: {
      posts: WorldPostSerializer.many(posts),
    })
  end

  # GET /posts/:id/stats
  def stats
    post = find_post
    authorize!(post, to: :manage?)
    render(json: {
      "notifiedFriends" => post.notified_friends.count,
      "viewers" => post.viewers.count,
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
      :quoted_post_id,
      :quiet,
      images: [],
    ])
    paused_friend_ids = current_user.friends.paused.pluck(:id)
    post = current_user.posts.build(
      hidden_from_ids: paused_friend_ids,
      **post_params,
    )
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
    post = find_post
    authorize!(post)
    post_params = params.expect(post: [
      :title,
      :body_html,
      :emoji,
      :visibility,
      :pinned_until,
      images: [],
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

  # POST /posts/:id/mark_seen
  def mark_seen
    current_friend = authenticate_friend!
    post = find_post
    authorize!(post)
    post.views.find_or_create_by!(friend: current_friend)
    render(json: { "authorId" => post.author_id })
  end

  # POST /posts/:id/mark_replied
  def mark_replied
    current_friend = authenticate_friend!
    post = find_post
    authorize!(post)
    post.reply_receipts.create!(friend: current_friend)
    render(json: { "authorId" => post.author_id })
  end

  # DELETE /posts/:id
  def destroy
    post = find_post
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

  sig { returns(Post) }
  def find_post
    Post.find(params.fetch(:id))
  end
end
