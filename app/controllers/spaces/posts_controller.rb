# typed: true
# frozen_string_literal: true

module Spaces
  class PostsController < ApplicationController
    # == Constants ==

    POSTS_PER_PAGE = 5

    # == Actions ==

    # GET /spaces/:space_id/posts[?type=...][&q=...]
    def index
      respond_to do |format|
        format.json do
          space = find_space!
          scope = authorized_scope(space.posts)
            .with_author_world
            .with_attached_images
            .with_quoted_post_and_attached_images
          if (type = params[:type])
            if type.is_a?(String)
              scope = scope.where(type:)
            else
              raise "Invalid type: #{type}"
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
          space_posts = load_space_posts(posts)
          render(json: {
            posts: SpacePostSerializer.many(space_posts),
            pagination: {
              next: pagy.next,
            },
          })
        end
      end
    end

    # GET /spaces/:space_id/posts/new?type=...
    def new
      respond_to do |format|
        format.html do
          type = T.let(params.fetch(:type), String)
          space = find_space!
          render(inertia: "NewSpacePostPage", props: {
            space: SpaceSerializer.one(space),
            type:,
            "userWorld" => WorldSerializer.one_if(current_user&.world),
          })
        end
      end
    end

    # GET /spaces/:space_id/posts/pinned
    def pinned
      respond_to do |format|
        format.json do
          space = find_space!
          posts = authorized_scope(space.posts)
            .currently_pinned
            .with_author_world
            .with_attached_images
            .with_quoted_post_and_attached_images
            .order(pinned_until: :asc, created_at: :asc)
          space_posts = load_space_posts(posts)
          render(json: {
            posts: SpacePostSerializer.many(space_posts),
          })
        end
      end
    end

    # POST /spaces/:id/posts
    def create
      respond_to do |format|
        format.json do
          current_user = authenticate_user!
          space = find_space!
          authorize!(space, to: :post?)
          post_params = params.expect(post: [
            :type,
            :title,
            :body_html,
            :emoji,
            :pinned_until,
            :spotify_track_id,
            :prompt_id,
            :pen_name,
            images: [],
          ])
          post = space.posts.build(
            author: current_user,
            visibility: :public,
            **post_params,
          )
          if post.save
            render(
              json: {
                post: PostSerializer.one(post),
              },
              status: :created,
            )
          else
            render(
              json: {
                errors: post.form_errors,
              },
              status: :unprocessable_content,
            )
          end
        end
      end
    end

    # PUT /spaces/posts/:id
    def update
      respond_to do |format|
        format.json do
          post = find_post!(
            scope: Post.where.associated(:space)
              .with_attached_images
              .with_quoted_post_and_attached_images,
          )
          authorize!(post)
          post_params = params.expect(post: [
            :title,
            :body_html,
            :emoji,
            :pinned_until,
            :spotify_track_id,
            :pen_name,
            images: [],
          ])
          if post.update(post_params)
            render(json: {
              post: PostSerializer.one(post),
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

    # DELETE /spaces/posts/:id
    def destroy
      respond_to do |format|
        format.json do
          post = find_post!
          authorize!(post)
          space_id = post.space_id!
          if post.destroy
            render(json: { "spaceId" => space_id })
          else
            render(
              json: {
                errors: post.errors.full_messages,
              },
              status: :unprocessable_content,
            )
          end
        end
      end
    end

    private

    # == Helpers ==

    sig { params(scope: Post::PrivateRelation).returns(Post) }
    def find_post!(scope: Post.where.associated(:space))
      scope.find(params.fetch(:id))
    end

    sig { params(posts: T::Enumerable[Post]).returns(T::Array[SpacePost]) }
    def load_space_posts(posts)
      post_ids = posts.map(&:id)
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
      if (user = current_user)
        viewed_post_ids = T.let(
          user.post_views.where(post_id: post_ids)
            .distinct.pluck(:post_id).to_set,
          T::Set[String],
        )
        replied_post_ids = T.let(
          user.post_reply_receipts.where(post_id: post_ids)
            .distinct.pluck(:post_id).to_set,
          T::Set[String],
        )
      end
      posts.map do |post|
        author = post.author!
        reply_to_number = if signed_in? && author.allow_space_replies? &&
            !post.pen_name?
          if (world = author.world)
            world.reply_to_number
          else
            author.phone_number
          end
        end
        SpacePost.new(
          post:,
          repliers: repliers_by_post_id.fetch(post.id, 0),
          seen: viewed_post_ids&.include?(post.id) || false,
          replied: replied_post_ids&.include?(post.id) || false,
          reply_to_number:,
        )
      end
    end
  end
end
