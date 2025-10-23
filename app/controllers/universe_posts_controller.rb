# typed: true
# frozen_string_literal: true

class UniversePostsController < ApplicationController
  # == Actions
  # GET /universe/posts
  def index
    posts = Post
      .with_quoted_post_and_attached_images
      .where(id: Post.user_created.select(:id))
      .visible_to_public
    pagy, paginated_posts = pagy_keyset(
      posts.order(created_at: :desc, id: :asc),
      limit: 5,
    )
    render(json: {
      posts: UniversePostSerializer.many(paginated_posts),
      pagination: {
        next: pagy.next,
      },
    })
  end
end
