# typed: true
# frozen_string_literal: true

class UserPostsController < ApplicationController
  # == Actions ==

  # GET /users/:user_id/posts?date=...
  def index
    respond_to do |format|
      format.json do
        user = find_user
        scope = user.posts
          .with_attached_images
          .with_quoted_post_and_attached_images
          .with_encouragement
        if (date_param = params[:date])
          if date_param.is_a?(String)
            time = date_param.to_time or raise "Invalid date: #{date_param}"
            scope = scope.where(created_at: time.all_day)
          else
            raise "Invalid date: #{date_param}"
          end
        end
        pagy, posts = if (friend = current_friend)
          paginate_posts(scope.visible_to(friend))
        else
          paginate_posts(scope.visible_to_friends).tap do |_, posts|
            posts.map! do |post|
              post.visibility == :public ? post : post.becomes(MaskedPost)
            end
          end
        end
        post_ids = posts.map(&:id)
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
            posts.map do |post|
              repliers = repliers_by_post_id.fetch(post.id, 0)
              seen = views_by_post_id.include?(post.id)
              replied = replied_post_ids.include?(post.id)
              friend_post = UserFriendPost.new(
                post:,
                repliers:,
                seen:,
                replied:,
              )
              UserFriendPostSerializer.one(friend_post)
            end
          else
            posts.map do |post|
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
    end
  end

  # GET /users/:user_id/posts/pinned
  def pinned
    respond_to do |format|
      format.json do
        user = find_user
        scope = user.posts.currently_pinned
          .with_attached_images
          .with_quoted_post_and_attached_images
        posts = if (friend = current_friend)
          find_pinned_posts(scope.visible_to(friend))
        else
          find_pinned_posts(scope.visible_to_friends).tap do |posts|
            posts.map! do |post|
              post.visibility == :public ? post : post.becomes(MaskedPost)
            end
          end
        end
        post_ids = posts.map(&:id)
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
    end
  end

  private

  # == Helpers ==

  sig { params(scope: User::PrivateRelation).returns(User) }
  def find_user(scope: User.all)
    scope.find(params.fetch(:user_id))
  end

  sig do
    params(scope: T.any(
      Post::PrivateRelation,
      Post::PrivateCollectionProxy,
    )).returns(Post)
  end
  def find_post(scope: Post.all)
    scope.find(params.fetch(:id))
  end

  sig do
    params(scope: T.any(
      Post::PrivateRelation,
      Post::PrivateCollectionProxy,
      Post::PrivateAssociationRelation,
    )).returns([
      Pagy::Keyset,
      T::Array[Post],
    ])
  end
  def paginate_posts(scope)
    pagy_keyset(
      scope.order(created_at: :desc, id: :asc),
      limit: 5,
    )
  end

  sig do
    params(scope: T.any(
      Post::PrivateRelation,
      Post::PrivateCollectionProxy,
      Post::PrivateAssociationRelation,
    )).returns(T::Array[Post])
  end
  def find_pinned_posts(scope)
    scope.currently_pinned.order(pinned_until: :asc, created_at: :asc).to_a
  end
end
