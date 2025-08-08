# typed: true
# frozen_string_literal: true

class PostReactionsController < ApplicationController
  # == Filters
  before_action :authenticate_friend!, only: %i[create destroy]

  # == Actions
  # GET /posts/:post_id/reactions
  def index
    post = load_post(scope: Post.with_reactions)
    reactions = authorized_scope(post.reactions)
    render(json: {
      reactions: PostReactionSerializer.many(reactions),
    })
  end

  # POST /posts/:post_id/reactions?friend_token=...
  def create
    current_friend = authenticate_friend!
    post = load_post
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

  # DELETE /post_reactions/:id
  def destroy
    reaction = load_reaction
    authorize!(reaction)
    reaction.destroy!
    render(json: { "postId": reaction.post_id })
  end

  private

  # == Helpers
  sig { params(scope: Post::PrivateRelation).returns(Post) }
  def load_post(scope: Post.all)
    scope.find(params.fetch(:post_id))
  end

  sig { params(scope: PostReaction::PrivateRelation).returns(PostReaction) }
  def load_reaction(scope: PostReaction.all)
    scope.find(params.fetch(:id))
  end
end
