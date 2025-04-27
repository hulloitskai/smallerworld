# typed: true
# frozen_string_literal: true

class PostReactionsController < ApplicationController
  # == Filters
  before_action :authenticate_friend!, only: :create

  # == Actions
  # GET /posts/:post_id/reactions
  def index
    post = find_post
    reactions = authorized_scope(post.reactions)
    render(json: { reactions: PostReactionSerializer.many(reactions) })
  end

  # POST /posts/:post_id/reactions?friend_token=...
  def create
    current_friend = authenticate_friend!
    post = find_post
    reaction_params = params.expect(reaction: [:emoji])
    reaction = post.reactions.build(friend: current_friend, **reaction_params)
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
    reaction = find_reaction
    authorize!(reaction)
    reaction.destroy!
    render(json: { "postId": reaction.post_id })
  end

  private

  # == Helpers
  sig { returns(Post) }
  def find_post
    post_id = params[:post_id] or
      raise ActionController::ParameterMissing, "Missing post ID"
    Post.find(post_id)
  end

  sig { returns(PostReaction) }
  def find_reaction
    reaction_id = params[:id] or
      raise ActionController::ParameterMissing, "Missing reaction ID"
    PostReaction.find(reaction_id)
  end
end
