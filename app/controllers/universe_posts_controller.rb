# typed: true
# frozen_string_literal: true

class UniversePostsController < ApplicationController
  # == Actions
  # GET /universe/posts
  def index
    posts = Post.where(id: Post.user_created.select(:id)).visible_to_public
    posts = posts.includes(images_attachments: :blob)
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
