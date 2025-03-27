# typed: true
# frozen_string_literal: true

class PostsController < ApplicationController
  # == Filters
  before_action :authenticate_user!, except: :mark_as_replied
  before_action :authenticate_friend!, only: :mark_as_replied

  # == Actions
  # GET /posts
  def index
    user = authenticate_user!
    posts = user.posts.includes(:image_blob).order(created_at: :desc, id: :asc)
    pagy, paginated_posts = pagy_keyset(posts, limit: 5)
    render(json: {
      posts: PostSerializer.many(paginated_posts),
      pagination: {
        next: pagy.next,
      },
    })
  end

  # GET /posts/pinned
  def pinned
    user = authenticate_user!
    posts = user
      .posts
      .currently_pinned
      .includes(:image_blob)
      .order(pinned_until: :asc, created_at: :asc)
    render(json: { posts: PostSerializer.many(posts) })
  end

  # GET /posts/:id/stats
  def stats
    post_id = T.let(params.fetch(:id), String)
    post = Post.find(post_id)
    authorize!(post, to: :manage?)
    render(json: {
      "notifiedFriends" => post.notified_friends.count,
    })
  end

  # POST /posts
  def create
    current_user = authenticate_user!
    post_params = T.let(
      params.expect(post: %i[
        type
        title
        body_html
        emoji
        image
        visibility
        pinned_until
      ]),
      ActionController::Parameters,
    )
    post = current_user.posts.build(post_params)
    if post.save
      render(json: { post: PostSerializer.one(post) }, status: :created)
    else
      render(json: { errors: post.form_errors }, status: :unprocessable_entity)
    end
  end

  # PUT /posts/:id
  def update
    post_id = params.fetch(:id)
    post = Post.find(post_id)
    authorize!(post)
    post_params = params.expect(post: %i[
      title
      body_html
      emoji
      image
      visibility
      pinned_until
    ])
    if post.update(post_params)
      render(json: { post: PostSerializer.one(post) })
    else
      render(json: { errors: post.form_errors }, status: :unprocessable_entity)
    end
  end

  # POST /posts/:id/mark_as_replied
  def mark_as_replied
    post_id = T.let(params.fetch(:id), String)
    post = Post.find(post_id)
    authorize!(post)
    friend = authenticate_friend!
    post.reply_receipts.create!(friend:)
    render(json: { "authorId" => post.author_id })
  end

  # DELETE /posts/:id
  def destroy
    current_user = authenticate_user!
    post_id = params.fetch(:id)
    post = current_user.posts.find(post_id)
    if post.destroy
      render(json: {})
    else
      render(
        json: { errors: post.errors.full_messages },
        status: :unprocessable_entity,
      )
    end
  end
end
