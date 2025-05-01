# typed: true
# frozen_string_literal: true

class UniversePostsController < ApplicationController
  # == Actions
  # GET /universe/posts
  def index
    posts = Post.where(id: Post.user_created.select(:id)).visible_to_public
    posts = posts.includes(:image_blob)
    pagy, paginated_posts = pagy_keyset(
      posts.order(created_at: :desc, id: :asc),
      limit: 5,
    )
    universe_posts = paginated_posts.map { |post| UniversePost.new(post:) }
    render(json: {
      posts: UniversePostSerializer.many(universe_posts),
      pagination: {
        next: pagy.next,
      },
    })
  end
end
