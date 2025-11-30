# typed: true
# frozen_string_literal: true

class PostsController < ApplicationController
  # == Constants ==

  POSTS_PER_PAGE = 5

  # == Filters ==

  before_action :authenticate_friend!, only: %i[share mark_replied]
  before_action :require_authentication!, only: :mark_seen

  # == Actions ==

  # GET /posts/:id/print
  def print
    respond_to do |format|
      format.html do
        post = find_post!
        unless post.visibility == :public
          raise "Only public posts can be printed"
        end

        author = post.author!
        render(inertia: "PostPrintPage", props: {
          post: PostSerializer.one(post),
          "authorName" => author.name,
          "authorWorld" => AuthorWorldProfileSerializer.one_if(author.world),
        })
      end
    end
  end

  # POST /posts/:id/share?friend_token=...
  def share
    respond_to do |format|
      format.json do
        current_friend = authenticate_friend!
        post = find_post!
        authorize!(post)
        share = post.shares.find_or_create_by!(sharer: current_friend)
        render(json: {
          share: PostShareSerializer.one(share),
        })
      end
    end
  end

  # POST /posts/:id/mark_seen[?friend_token=...]
  def mark_seen
    respond_to do |format|
      format.json do
        viewer = require_authentication!
        post = find_post!
        authorize!(post)
        viewer.post_views.find_or_create_by!(post:)
        render(json: {
          "worldId" => post.world_id,
        })
      end
    end
  end

  # POST /posts/:id/mark_replied?friend_token=...
  def mark_replied
    respond_to do |format|
      format.json do
        current_friend = authenticate_friend!
        post = find_post!
        authorize!(post)
        post.reply_receipts.create!(friend: current_friend)
        render(json: {
          "worldId" => post.world_id,
        })
      end
    end
  end

  private

  sig { params(scope: Post::PrivateRelation).returns(Post) }
  def find_post!(scope: Post.all)
    scope.find(params.fetch(:id))
  end
end
