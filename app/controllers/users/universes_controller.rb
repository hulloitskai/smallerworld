# typed: true
# frozen_string_literal: true

module Users
  class UniversesController < ApplicationController
    # == Actions ==

    # GET /world/universe
    def show
      respond_to do |format|
        format.html do
          render(inertia: "UserUniversePage", props: {
            "userWorld" => WorldSerializer.one_if(current_world),
          })
        end
      end
    end

    # GET /universe/worlds
    def worlds
      respond_to do |format|
        format.json do
          current_user = authenticate_user!
          associated_friends = scoped do
            friends = current_user.associated_friends
            if (world = current_user.world)
              friends.where.not(world_id: world.id)
            else
              friends
            end
          end
          worlds = World
            .with_attached_icon
            .includes(:owner)
            .where(id: associated_friends.select(:world_id))
            .or(World.where(owner_id: current_user.id))
            .left_outer_joins(:posts)
            .group("worlds.id")
            .select(
              "worlds.*",
              "MAX(posts.created_at) AS last_post_created_at",
            )
            .order("last_post_created_at DESC NULLS LAST")
          friends_by_world_id = associated_friends.index_by(&:world_id)
          uncleared_notification_counts_by_friend_id = Notification
            .where(recipient: associated_friends)
            .joins("INNER JOIN friends ON friends.id = notifications.recipient_id") # rubocop:disable Layout/LineLength
            .where("friends.notifications_last_cleared_at IS NULL OR notifications.created_at > friends.notifications_last_cleared_at") # rubocop:disable Layout/LineLength
            .group("notifications.recipient_id")
            .count
          profiles = worlds.map do |world|
            friend = friends_by_world_id[world.id]
            uncleared_notification_count = if friend
              uncleared_notification_counts_by_friend_id[friend.id] || 0
            else
              0
            end
            UniverseWorldProfile.new(
              world:,
              uncleared_notification_count:,
              last_post_created_at: world[:last_post_created_at],
              associated_friend_access_token: friend&.access_token,
            )
          end
          render(json: {
            worlds: UniverseWorldProfileSerializer.many(profiles),
          })
        end
      end
    end

    # GET /universe/posts
    def posts
      respond_to do |format|
        format.json do
          current_user = authenticate_user!
          associated_friends = scoped do
            friends = current_user.associated_friends
            if (world = current_user.world)
              friends.where.not(world_id: world.id)
            else
              friends
            end
          end
          scope = authorized_scope(Post.in_world)
            .where.not(id: Post.auto_generated.select(:id))
            .with_world
            .with_attached_images
            .with_quoted_post_and_attached_images
            .with_encouragement
            .with_author
          pagy, posts = paginate_posts(scope)
          post_ids = posts.map(&:id)
          viewed_post_ids = T.let(
            PostView.where(post_id: post_ids)
              .and(
                PostView.where(viewer: associated_friends)
                  .or(PostView.where(viewer: current_user)),
              )
              .distinct
              .pluck(:post_id)
              .to_set,
            T::Set[String],
          )
          replied_post_ids = T.let(
            PostReplyReceipt
              .where(post_id: post_ids)
              .and(
                PostReplyReceipt.where(replier: associated_friends)
                  .or(PostReplyReceipt.where(replier: current_user)),
              )
              .pluck(:post_id)
              .to_set,
            T::Set[String],
          )
          repliers_by_post_id = PostReplyReceipt
            .where(post_id: post_ids)
            .group(:post_id)
            .select(
              :post_id,
              "COUNT(DISTINCT (replier_id, replier_type)) AS repliers",
            )
            .map do |reply_receipt|
              repliers = T.let(reply_receipt[:repliers], Integer)
              [reply_receipt.post_id, repliers]
            end
            .to_h
          associated_friends_by_world_id = associated_friends
            .select(:id, :world_id, :access_token)
            .index_by(&:world_id)
          universe_posts = posts.map do |post|
            world = post.world!
            associated_friend = if (friend = associated_friends_by_world_id[world.id]) # rubocop:disable Layout/LineLength
              UniversePostAssociatedFriend.new(
                id: friend.id,
                access_token: friend.access_token,
                world_reply_to_number: world.reply_to_number,
              )
            end
            UniversePost.new(
              world:,
              post:,
              repliers: repliers_by_post_id.fetch(post.id, 0),
              replied: replied_post_ids.include?(post.id),
              seen: viewed_post_ids.include?(post.id),
              associated_friend:,
            )
          end
          render(json: {
            posts: UniversePostSerializer.many(universe_posts),
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
        scope.order("posts.created_at" => :desc, "posts.id" => :asc),
        limit: 5,
      )
    end
  end
end
