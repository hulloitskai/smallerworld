# typed: true
# frozen_string_literal: true

module Users::Worlds
  class PostsController < ApplicationController
    # == Constants ==

    POSTS_PER_PAGE = 5

    # == Actions ==

    # GET /world/posts[?date=...][&type=...][&q=...]
    def index
      respond_to do |format|
        format.json do
          world = current_world!
          scope = authorized_scope(world.posts)
            .with_attached_images
            .with_quoted_post_and_attached_images
            .with_encouragement
            .with_author
          if (type = params[:type])
            if type.is_a?(String)
              scope = scope.where(type:)
            else
              raise "Invalid type: #{type}"
            end
          end
          if (date_param = params[:date])
            if date_param.is_a?(String)
              time = date_param.to_time or raise "Invalid date: #{date_param}"
              scope = scope.where(created_at: time.all_day)
            else
              raise "Invalid date: #{date_param}"
            end
          end
          ordering = { created_at: :desc, id: :asc }
          pagy, posts = if (query = params[:q])
            scope = scope.search(query).order(**ordering)
            pagy(scope, limit: POSTS_PER_PAGE)
          else
            scope = scope.order(**ordering)
            pagy_keyset(scope, limit: POSTS_PER_PAGE)
          end
          render(json: {
            posts: PostSerializer.many(posts),
            pagination: {
              next: pagy.next
            }
          })
        end
      end
    end

    # GET /world/posts/pinned
    def pinned
      respond_to do |format|
        format.json do
          world = current_world!
          posts = authorized_scope(world.posts.currently_pinned)
            .with_attached_images
            .with_quoted_post_and_attached_images
            .with_encouragement
            .order(pinned_until: :asc, created_at: :asc)
          render(json: {
            posts: PostSerializer.many(posts)
          })
        end
      end
    end

    # GET /world/posts/:id/stats
    def stats
      respond_to do |format|
        format.json do
          post = find_post!
          authorize!(post, to: :manage?)
          repliers = post.reply_receipts
            .count("DISTINCT (replier_id, replier_type)")
          render(json: {
            "notifiedFriends" => post.notified_friends.count,
            viewers: post.friend_viewers.count,
            repliers:
          })
        end
      end
    end

    # GET /world/posts/:id/viewers
    def viewers
      respond_to do |format|
        format.json do
          post = find_post!
          authorize!(post)
          views = PostView
            .where(
              id: PostView
                .where(post:)
                .select("DISTINCT ON (viewer_type, viewer_id) id")
                .order("viewer_type, viewer_id, created_at DESC"),
            )
            .reverse_chronological
            .with_viewer
          reactions_by_viewer = PostReaction
            .where(post: post)
            .group(:reactor_type, :reactor_id)
            .pluck(
              :reactor_type,
              :reactor_id,
              Arel.sql("ARRAY_AGG(emoji ORDER BY created_at)"),
            )
            .each_with_object({}) do |(reactor_type, reactor_id, emojis), hash|
              hash[[ reactor_type, reactor_id ]] = emojis
            end
          viewers = views.filter_map do |view|
            reaction_emojis = reactions_by_viewer.fetch(
              [ view.viewer_type, view.viewer_id ],
              [],
            )
            UserPostViewer.new(
              viewer: view.viewer!,
              last_viewed_at: view.created_at,
              reaction_emojis:,
            )
          end
          render(json: {
            viewers: UserPostViewerSerializer.many(viewers)
          })
        end
      end
    end

    # GET /world/posts/:id/audience
    def audience
      respond_to do |format|
        format.json do
          post = find_post!
          authorize!(post)
          notified_ids = post.notifications.to_friends.pluck(:recipient_id) +
            post.text_blasts.pluck(:friend_id)
          render(json: {
            "hiddenFromIds" => post.hidden_from_ids,
            "notifiedIds" => notified_ids,
            "visibleToIds" => post.visible_to_ids
          })
        end
      end
    end

    # POST /world/posts
    def create
      respond_to do |format|
        format.json do
          current_user = authenticate_user!
          world = current_world!
          post_params = params.expect(post: [
            :type,
            :title,
            :body_html,
            :emoji,
            :visibility,
            :pinned_until,
            :encouragement_id,
            :quoted_post_id,
            :spotify_track_id,
            :prompt_id,
            images: [],
            friend_ids_to_notify: [],
            hidden_from_ids: [],
            visible_to_ids: []
          ])
          post = world.posts.build(author: current_user, **post_params)
          if post.save
            render(
              json: {
                post: PostSerializer.one(post)
              },
              status: :created,
            )
          else
            render(
              json: {
                errors: post.form_errors
              },
              status: :unprocessable_content,
            )
          end
        end
      end
    end

    # PUT /world/posts/:id
    def update
      respond_to do |format|
        format.json do
          post = find_post!(
            scope: Post
              .where.associated(:world)
              .with_attached_images
              .with_quoted_post_and_attached_images,
          )
          authorize!(post)
          post_params = params.expect(post: [
            :title,
            :body_html,
            :emoji,
            :visibility,
            :pinned_until,
            :encouragement_id,
            :spotify_track_id,
            images: [],
            friend_ids_to_notify: [],
            hidden_from_ids: [],
            visible_to_ids: []
          ])
          if post.update(post_params)
            render(json: {
              post: PostSerializer.one(post)
            })
          else
            render(
              json: { errors: post.form_errors },
              status: :unprocessable_content,
            )
          end
        end
      end
    end

    # DELETE /world/posts/:id
    def destroy
      respond_to do |format|
        format.json do
          post = find_post!
          authorize!(post)
          world_id = post.world_id!
          if post.destroy
            render(json: { "worldId" => world_id })
          else
            render(
              json: {
                errors: post.errors.full_messages
              },
              status: :unprocessable_content,
            )
          end
        end
      end
    end

    # POST /world/posts/:id/share
    def share
      respond_to do |format|
        format.json do
          current_user = authenticate_user!
          post = find_post!
          authorize!(post)
          share = post.shares.find_or_create_by!(sharer: current_user)
          render(json: {
            share: PostShareSerializer.one(share)
          })
        end
      end
    end

    private

    # == Helpers ==

    sig { params(scope: Post::PrivateRelation).returns(Post) }
    def find_post!(scope: Post.where.associated(:world))
      scope.find(params.fetch(:id))
    end
  end
end
