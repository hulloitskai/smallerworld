# typed: true
# frozen_string_literal: true

class UserPostsController < ApplicationController
  # == Actions
  # GET /users/:user_id/posts
  def index
    user_id = T.let(params.fetch(:user_id), String)
    user = User.find(user_id)
    posts = user.posts.includes(:image_blob)
    unless (friend = current_friend) && friend.chosen_family?
      posts = posts.visible_to_friends
    end
    pagy, paginated_posts = pagy_keyset(
      posts.order(created_at: :desc, id: :asc),
      limit: 5,
    )
    unless current_friend
      paginated_posts.map! do |post|
        post.visibility == :public ? post : MaskedPost.new(post:)
      end
    end
    post_ids = paginated_posts.map(&:id)
    replied_post_ids = if (friend = current_friend)
      PostReplyReceipt
        .where(post_id: post_ids, friend:)
        .pluck(:post_id)
        .to_set
    end
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
      replied = replied_post_ids&.include?(post.id)
      repliers = repliers_by_post_id.fetch(post.id, 0)
      PostView.new(post:, replied:, repliers:)
    end
    render(json: {
      posts: PostViewSerializer.many(post_views),
      pagination: {
        next: pagy.next,
      },
    })
  end

  # GET /users/:user_id/posts/pinned
  def pinned
    user_id = T.let(params.fetch(:user_id), String)
    user = User.find(user_id)
    posts = user.posts
      .currently_pinned
      .includes(:image_blob)
    unless (friend = current_friend) && friend.chosen_family?
      posts = posts.visible_to_friends
    end
    posts = posts.order(pinned_until: :asc).to_a
    unless current_friend
      posts.map! do |post|
        post.visibility == :public ? post : MaskedPost.new(post:)
      end
    end
    post_ids = posts.map(&:id)
    replied_post_ids = if (friend = current_friend)
      PostReplyReceipt
        .where(post_id: post_ids, friend:)
        .pluck(:post_id)
        .to_set
    end
    repliers_by_post_id = PostReplyReceipt
      .where(post_id: post_ids)
      .group(:post_id)
      .select(:post_id, "COUNT(DISTINCT friend_id) AS repliers")
      .map do |reply_receipt|
        repliers = T.let(reply_receipt[:repliers], Integer)
        [reply_receipt.post_id, repliers]
      end
      .to_h
    post_views = posts.map do |post|
      replied = replied_post_ids&.include?(post.id)
      repliers = repliers_by_post_id.fetch(post.id, 0)
      PostView.new(post:, replied:, repliers:)
    end
    render(json: { posts: PostViewSerializer.many(post_views) })
  end
end
