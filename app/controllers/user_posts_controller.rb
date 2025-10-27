# typed: true
# frozen_string_literal: true

class UserPostsController < ApplicationController
  # == Actions
  # GET /users/:user_id/posts
  def index
    user = load_user
    posts = user.posts
      .with_attached_images
      .with_quoted_post_and_attached_images
      .with_encouragement
    if (friend = current_friend)
      posts = posts.not_hidden_from(friend)
      posts = posts.visible_to_friends unless friend.chosen_family?
    end
    pagy, paginated_posts = pagy_keyset(
      posts.order(created_at: :desc, id: :asc),
      limit: 5,
    )
    paginated_posts = T.cast(paginated_posts, T::Array[Post])
    unless current_friend
      paginated_posts.map! do |post|
        post.visibility == :public ? post : post.becomes(MaskedPost)
      end
    end
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
    serialized_posts =
      if (friend = current_friend)
        views_by_post_id = PostView
          .where(post_id: post_ids, friend:)
          .group(:post_id)
          .pluck(:post_id)
          .to_set
        replied_post_ids =
          PostReplyReceipt
            .where(post_id: post_ids, friend:)
            .pluck(:post_id)
            .to_set
        paginated_posts.map do |post|
          repliers = repliers_by_post_id.fetch(post.id, 0)
          seen = views_by_post_id.include?(post.id)
          replied = replied_post_ids.include?(post.id)
          friend_post = UserFriendPost.new(post:, repliers:, seen:, replied:)
          UserFriendPostSerializer.one(friend_post)
        end
      else
        paginated_posts.map do |post|
          repliers = repliers_by_post_id.fetch(post.id, 0)
          public_post = UserPublicPost.new(post:, repliers:)
          UserPublicPostSerializer.one(public_post)
        end
      end
    render(json: {
      posts: serialized_posts,
      pagination: {
        next: pagy.next,
      },
    })
  end

  # GET /users/:user_id/posts/pinned
  def pinned
    user = load_user
    posts = user.posts.currently_pinned
      .with_attached_images
      .with_quoted_post_and_attached_images
    unless (friend = current_friend) && friend.chosen_family?
      posts = posts.visible_to_friends
    end
    posts = posts.order(pinned_until: :asc, created_at: :asc).to_a
    post_ids = posts.map(&:id)
    unless current_friend
      posts.map! do |post|
        post.visibility == :public ? post : post.becomes(MaskedPost)
      end
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
    serialized_posts = if (friend = current_friend)
      views_by_post_id = PostView
        .where(post_id: post_ids, friend:)
        .group(:post_id)
        .pluck(:post_id)
        .to_set
      replied_post_ids = PostReplyReceipt
        .where(post_id: post_ids, friend:)
        .pluck(:post_id)
        .to_set
      posts.map do |post|
        repliers = repliers_by_post_id.fetch(post.id, 0)
        seen = views_by_post_id.include?(post.id)
        replied = replied_post_ids.include?(post.id)
        friend_post = UserFriendPost.new(post:, repliers:, seen:, replied:)
        UserFriendPostSerializer.one(friend_post)
      end
    else
      posts.map do |post|
        repliers = repliers_by_post_id.fetch(post.id, 0)
        public_post = UserPublicPost.new(post:, repliers:)
        UserPublicPostSerializer.one(public_post)
      end
    end
    render(json: { posts: serialized_posts })
  end

  private

  # == Helpers
  sig { params(scope: User::PrivateRelation).returns(User) }
  def load_user(scope: User.all)
    scope.find(params.fetch(:user_id))
  end

  sig do
    params(scope: T.any(
      Post::PrivateRelation,
      Post::PrivateCollectionProxy,
    )).returns(Post)
  end
  def load_post(scope: Post.all)
    scope.find(params.fetch(:id))
  end
end
