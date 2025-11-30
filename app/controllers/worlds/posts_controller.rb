# typed: true
# frozen_string_literal: true

module Worlds
  class PostsController < Worlds::ApplicationController
    # == Actions ==

    # GET /worlds/:world_id/posts?date=...
    def index
      respond_to do |format|
        format.json do
          world = find_world!
          scope = authorized_scope(world.posts)
            .with_encouragement
            .with_attached_images
            .with_quoted_post_and_attached_images
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
            paginate_posts(scope.visible_to_friends).tap do |_, paged_posts|
              paged_posts.map! do |post|
                post.visibility == :public ? post : post.becomes(MaskedPost)
              end
            end
          end
          world_posts = load_world_posts(posts)
          render(json: {
            posts: WorldPostSerializer.many(world_posts),
            pagination: {
              next: pagy.next,
            },
          })
        end
      end
    end

    # GET /worlds/:world_id/posts/pinned
    def pinned
      respond_to do |format|
        format.json do
          world = find_world!
          scope = authorized_scope(world.posts)
            .currently_pinned
            .with_attached_images
            .with_quoted_post_and_attached_images
            .order(pinned_until: :asc, created_at: :asc)
          posts = if (friend = current_friend)
            scope.visible_to(friend).to_a
          else
            scope.visible_to_friends.to_a.tap do |posts|
              posts.map! do |post|
                post.visibility == :public ? post : post.becomes(MaskedPost)
              end
            end
          end
          world_posts = load_world_posts(posts)
          render(json: {
            posts: WorldPostSerializer.many(world_posts),
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

    sig { params(posts: T::Enumerable[Post]).returns(T::Array[WorldPost]) }
    def load_world_posts(posts)
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
      if (actor = current_friend || current_user)
        viewed_post_ids = T.let(
          actor.post_views.where(post_id: post_ids)
            .distinct.pluck(:post_id).to_set,
          T::Set[String],
        )
        replied_post_ids = T.let(
          actor.post_reply_receipts.where(post_id: post_ids)
            .distinct.pluck(:post_id).to_set,
          T::Set[String],
        )
      end
      posts.map do |post|
        replied = if replied_post_ids
          replied_post_ids.include?(post.id)
        else
          false
        end
        WorldPost.new(
          post:,
          repliers: repliers_by_post_id.fetch(post.id, 0),
          seen: viewed_post_ids&.include?(post.id) || false,
          replied:,
        )
      end
    end
  end
end
