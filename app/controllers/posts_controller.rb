# typed: true
# frozen_string_literal: true

class PostsController < ApplicationController
  # == Filters
  before_action :authenticate_user!, only: %i[stats create destroy]

  # == Actions
  # GET /users/1/posts
  def index
    user_id = T.let(params.fetch(:user_id), String)
    user = User.find(user_id)
    posts = authorized_scope(user.posts)
    pagy, paginated_posts = pagy_keyset(
      posts.order(created_at: :desc, id: :asc),
    )
    render(json: {
      posts: PostSerializer.many(paginated_posts),
      pagination: {
        next: pagy.next,
      },
    })
  end

  # GET /posts/1/stats
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
      params.expect(post: %i[type title body_html emoji]),
      ActionController::Parameters,
    )
    post = current_user.posts.build(post_params)
    if post.save
      render(json: { post: PostSerializer.one(post) })
    else
      render(
        json: { errors: post.errors.full_messages },
        status: :unprocessable_entity,
      )
    end
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
