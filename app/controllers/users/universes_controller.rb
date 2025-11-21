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
          chosen_family_friends = associated_friends.chosen_family
          general_friends = associated_friends.where.not(chosen_family: true)
          scope = Post
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
                .where(world_id: general_friends.select(:world_id))
                .where(
                  "NOT hidden_from_ids && ARRAY(?)",
                  general_friends.select(:id),
                ),
            )
            .or(
              Post
                .visible_to_chosen_family
                .where(world_id: chosen_family_friends.select(:world_id))
                .where(
                  "NOT hidden_from_ids && ARRAY(?)",
                  chosen_family_friends.select(:id),
                ),
            ).or(
              Post
                .secretly_visible
                .where(world_id: associated_friends.select(:world_id))
                .where(
                  "visible_to_ids && ARRAY(?)",
                  associated_friends.select(:id),
                ),
            )
            .with_attached_images
            .with_quoted_post_and_attached_images
            .with_encouragement
            .with_author
          pagy, posts = paginate_posts(scope)
          post_ids = posts.map(&:id)
          views_by_post_id = PostView
            .where(post_id: post_ids)
            .and(
              PostView.where(viewer: associated_friends)
                .or(PostView.where(viewer: current_user)),
            )
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
          associated_friends_by_world_id = associated_friends
            .select(:id, :world_id, :access_token)
            .index_by(&:world_id)
          serialized_posts = posts.map do |post|
            author = T.let(post.author!, User)
            if author == current_user
              author_post = UserUniverseAuthorPost.new(post:)
              UserUniverseAuthorPostSerializer.one(author_post)
            elsif (world_id = post.world_id) &&
                (associated_friend = associated_friends_by_world_id[world_id])
              seen = views_by_post_id.include?(post.id)
              replied = replied_post_ids.include?(post.id)
              repliers = repliers_by_post_id.fetch(post.id, 0)
              friend_post = UserUniverseFriendPost.new(
                associated_friend:,
                reply_to_number: author.phone_number,
                repliers:,
                post:,
                replied:,
                seen:,
              )
              UserUniverseFriendPostSerializer.one(friend_post)
            else
              seen = views_by_post_id.include?(post.id)
              public_post = UserUniversePublicPost.new(post:, seen:)
              UserUniversePublicPostSerializer.one(public_post)
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
end
