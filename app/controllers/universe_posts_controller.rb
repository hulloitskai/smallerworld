# typed: true
# frozen_string_literal: true

class UniversePostsController < ApplicationController
  # == Actions
  # GET /universe/posts
  def index
    posts = authorized_scope(Post.visible_to_public)
    posts = posts.includes(:image_blob)
    pagy, paginated_posts = pagy_keyset(
      posts.order(created_at: :desc, id: :asc),
      limit: 5,
    )
    paginated_posts = T.cast(paginated_posts, T::Array[Post])
    paginated_posts.map! do |post|
      allowed_to?(:show?, post) ? post : MaskedPost.new(post:)
    end unless current_friend
    post_ids = paginated_posts.map(&:id)
    repliers_by_post_id = PostReplyReceipt
      .where(post_id: post_ids)
      .group(:post_id)
      .select(:post_id, "COUNT(DISTINCT friend_id) AS repliers")
      .map do |reply_receipt|
        repliers = T.let(reply_receipt[:repliers], Integer)
        [reply_receipt.post_id, repliers]
      end
      .to_h
    post_views = paginated_posts.map do |post|
      repliers = repliers_by_post_id.fetch(post.id, 0)
      PostView.new(post:, repliers:)
    end
    render(json: {
      posts: PostViewSerializer.many(post_views),
      pagination: {
        next: pagy.next,
      },
    })
  end
end
