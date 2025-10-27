# typed: true
# frozen_string_literal: true

class LocalUniversePostsController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world/universe/posts
  def index
    current_user = authenticate_user!
    associated_friends = current_user
      .associated_friends
      .where.not(user_id: current_user.id)
    chosen_family_friends = associated_friends.chosen_family
    other_friends = associated_friends.where.not(chosen_family: true)
    posts = Post
      .with_attached_images
      .with_quoted_post_and_attached_images
      .with_encouragement
      .includes(:author)
      .visible_to_public
      .where(id: Post.user_created.select(:id))
      .or(
        Post
          .where(author_id: current_user.id)
          .where.not(visibility: :only_me),
      )
      .or(
        Post
          .where(author_id: other_friends.select(:user_id))
          .where("NOT hidden_from_ids && ARRAY(?)", other_friends.select(:id))
          .visible_to_friends,
      )
      .or(
        Post
          .where(author_id: chosen_family_friends.select(:user_id))
          .where(
            "NOT hidden_from_ids && ARRAY(?)", chosen_family_friends.select(:id)
          )
          .visible_to_chosen_family,
      )
    pagy, paginated_posts = pagy_keyset(
      posts.order(created_at: :desc, id: :asc),
      limit: 5,
    )
    post_ids = paginated_posts.map(&:id)
    views_by_post_id = PostView
      .where(post_id: post_ids, friend: associated_friends)
      .group(:post_id)
      .pluck(:post_id)
      .to_set
    replied_post_ids = PostReplyReceipt
      .where(post_id: post_ids, friend: associated_friends)
      .pluck(:post_id)
      .to_set
    repliers_by_post_id = PostReplyReceipt
      .where(post_id: post_ids)
      .group(:post_id)
      .select(:post_id, "COUNT(DISTINCT friend_id) AS repliers")
      .map do |reply_receipt|
        repliers = T.let(reply_receipt[:repliers], Integer)
        [reply_receipt.post_id, repliers]
      end
      .to_h
    associated_friends_by_user_id = associated_friends
      .select(:id, :user_id, :access_token)
      .index_by(&:user_id)
    serialized_posts = paginated_posts.map do |post|
      associated_friend = associated_friends_by_user_id[post.author_id]
      author = T.let(post.author!, User)
      if author == current_user
        LocalUniverseAuthorPostSerializer.one(post)
      elsif associated_friend
        seen = views_by_post_id.include?(post.id)
        replied = replied_post_ids.include?(post.id)
        repliers = repliers_by_post_id.fetch(post.id, 0)
        friend_post = LocalUniverseFriendPost.new(
          associated_friend:,
          reply_to_number: author.phone_number,
          repliers:,
          post:,
          replied:,
          seen:,
        )
        LocalUniverseFriendPostSerializer.one(friend_post)
      else
        LocalUniversePublicPostSerializer.one(post)
      end
    end
    render(json: {
      posts: serialized_posts,
      pagination: {
        next: pagy.next,
      },
    })
  end
end
