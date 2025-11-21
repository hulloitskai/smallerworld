# typed: true
# frozen_string_literal: true

class PostReactionsController < ApplicationController
  # == Filters ==

  before_action :authenticate_friend!, only: %i[create destroy]

  # == Actions ==

  # GET /posts/:post_id/reactions
  def index
    respond_to do |format|
      format.json do
        post = find_post!(scope: Post.with_reactions)
        reactions = authorized_scope(post.reactions)
        render(json: {
          reactions: PostReactionSerializer.many(reactions),
        })
      end
    end
  end

  # POST /posts/:post_id/reactions?friend_token=...
  def create
    respond_to do |format|
      format.json do
        current_friend = authenticate_friend!
        post = find_post!
        reaction_params = params.expect(reaction: [:emoji])
        reaction = post.reactions.find_or_create_by!(
          friend: current_friend,
          **reaction_params,
        )
        render(
          json: {
            reaction: PostReactionSerializer.one(reaction),
          },
          status: :created,
        )
      end
    end
  end

  # DELETE /post_reactions/:id
  def destroy
    respond_to do |format|
      format.json do
        reaction = find_reaction!
        authorize!(reaction)
        reaction.destroy!
        render(json: { "postId": reaction.post_id })
      end
    end
  end

  private

  # == Helpers ==

  sig { params(scope: Post::PrivateRelation).returns(Post) }
  def find_post!(scope: Post.all)
    scope.find(params.fetch(:post_id))
  end

  sig { params(scope: PostReaction::PrivateRelation).returns(PostReaction) }
  def find_reaction!(scope: PostReaction.all)
    scope.find(params.fetch(:id))
  end
end
