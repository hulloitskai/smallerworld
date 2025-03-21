# typed: true
# frozen_string_literal: true

class PostReactionsController < ApplicationController
  # == Filters
  before_action :authenticate_friend!, only: :create

  # == Actions
  # GET /posts/:post_id/reactions
  def index
    post_id = T.let(params.fetch(:post_id), String)
    post = Post.find(post_id)
    reactions = authorized_scope(post.reactions)
    render(json: { reactions: PostReactionSerializer.many(reactions) })
  end

  # POST /posts/:post_id/reactions?friend_token=...
  def create
    current_friend = authenticate_friend!
    post_id = T.let(params.fetch(:post_id), String)
    post = Post.find(post_id)
    reaction_params = params.expect(reaction: [:emoji])
    reaction = post.reactions.build(
      friend: current_friend,
      **reaction_params,
    )
    if reaction.save
      render(
        json: { reaction: PostReactionSerializer.one(reaction) },
        status: :created,
      )
    else
      render(
        json: { errors: reaction.form_errors },
        status: :unprocessable_entity,
      )
    end
  end

  # DELETE /post_reactions/:id
  def destroy
    reaction_id = T.let(params.fetch(:id), String)
    reaction = PostReaction.find(reaction_id)
    authorize!(reaction)
    reaction.destroy!
    render(json: { "postId": reaction.post_id })
  end
end
