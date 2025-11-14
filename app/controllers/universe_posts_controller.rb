# typed: true
# frozen_string_literal: true

class UniversePostsController < ApplicationController
  # == Filters ==

  before_action :authenticate_user!

  # == Actions ==

  # GET /world/universe/posts
  def index
    respond_to do |format|
      format.json do
        current_user = authenticate_user!
        associated_friends = current_user
          .associated_friends
          .where.not(user_id: current_user.id)
        chosen_family_friends = associated_friends.chosen_family
        general_friends = associated_friends.where.not(chosen_family: true)
        scope = Post
          .with_attached_images
          .with_quoted_post_and_attached_images
          .with_encouragement
          .includes(:author)
          .publicly_visible
          .where(id: Post.user_created.select(:id))
          .or(
            Post
              .where(author_id: current_user.id)
              .where.not(visibility: :secret),
          )
          .or(
            Post
              .visible_to_friends
              .where(author_id: general_friends.select(:user_id))
              .where(
                "NOT hidden_from_ids && ARRAY(?)",
                general_friends.select(:id),
              ),
          )
          .or(
            Post
              .visible_to_chosen_family
              .where(author_id: chosen_family_friends.select(:user_id))
              .where(
                "NOT hidden_from_ids && ARRAY(?)",
                chosen_family_friends.select(:id),
              ),
          ).or(
            Post
              .secretly_visible
              .where(author_id: associated_friends.select(:user_id))
              .where(
                "visible_to_ids && ARRAY(?)",
                associated_friends.select(:id),
              ),
          )
        pagy, posts = paginate_posts(scope)
        post_ids = posts.map(&:id)
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
        serialized_posts = posts.map do |post|
          associated_friend = associated_friends_by_user_id[post.author_id]
          author = T.let(post.author!, User)
          if author == current_user
            UniverseAuthorPostSerializer.one(post)
          elsif associated_friend
            seen = views_by_post_id.include?(post.id)
            replied = replied_post_ids.include?(post.id)
            repliers = repliers_by_post_id.fetch(post.id, 0)
            friend_post = UniverseFriendPost.new(
              associated_friend:,
              reply_to_number: author.phone_number,
              repliers:,
              post:,
              replied:,
              seen:,
            )
            UniverseFriendPostSerializer.one(friend_post)
          else
            UniversePublicPostSerializer.one(post)
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

  private

  # == Helpers ==

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
end
