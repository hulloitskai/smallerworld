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

  private

  sig { params(scope: Post::PrivateRelation).returns(Post) }
  def load_post(scope: Post.all)
    scope.find(params.fetch(:id))
  end
end
