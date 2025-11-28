# typed: true
# frozen_string_literal: true

module Spaces
  class PostsController < ApplicationController
    # == Constants ==

    POSTS_PER_PAGE = 5

    # == Actions ==

    # GET /spaces/:id/posts[?type=...][&q=...]
    def index
      respond_to do |format|
        format.json do
          space = find_space!
          scope = authorized_scope(space.posts)
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
              next: pagy.next,
            },
          })
        end
      end
    end

    # GET /spaces/:id/posts/pinned
    def pinned
      respond_to do |format|
        format.json do
          space = find_space!
          posts = authorized_scope(space.posts.currently_pinned)
            .with_attached_images
            .with_quoted_post_and_attached_images
            .with_encouragement
            .order(pinned_until: :asc, created_at: :asc)
          render(json: {
            posts: PostSerializer.many(posts),
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
            scope: Post.where.associated(:space).with_attached_images
            .with_quoted_post_and_attached_images,
          )
          authorize!(post)
          post_params = params.expect(post: [
            :title,
            :body_html,
            :emoji,
            :pinned_until,
            :spotify_track_id,
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
  end
end
