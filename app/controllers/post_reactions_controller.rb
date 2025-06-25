# typed: true
# frozen_string_literal: true

class PostReactionsController < ApplicationController
  # == Filters
  before_action :authenticate_friend!, only: :create

  # == Actions
  # GET /posts/:post_id/reactions
  def index
    post = find_post(includes: :reactions)
    reactions = authorized_scope(post.reactions)
    render(json: { reactions: PostReactionSerializer.many(reactions) })
  end

  # POST /posts/:post_id/reactions?friend_token=...
  def create
    current_friend = authenticate_friend!
    post = find_post
    reaction_params = params.expect(reaction: [:emoji])
    reaction = post.reactions.create!(friend: current_friend, **reaction_params)
    render(
      json: { reaction: PostReactionSerializer.one(reaction) },
      status: :created,
    )
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
  sig { params(includes: T.untyped).returns(Post) }
  def find_post(includes: nil)
    posts = Post.all
    posts = posts.includes(includes) if includes
    posts.find(params.fetch(:post_id))
  end

  sig { returns(PostReaction) }
  def find_reaction
    PostReaction.find(params.fetch(:id))
  end
end
