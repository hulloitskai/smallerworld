# typed: true
# frozen_string_literal: true

class PostsController < ApplicationController
  # == Constants
  POSTS_PER_PAGE = 5

  # == Filters
  before_action :authenticate_friend!

  # == Actions
  # POST /posts/:id/share?friend_token=...
  def share
    current_friend = authenticate_friend!
    post = load_post
    authorize!(post)
    share = post.shares.find_or_create_by!(sharer: current_friend)
    render(json: {
      share: PostShareSerializer.one(share),
    })
  end

  # POST /posts/:id/mark_seen?friend_token=...
  def mark_seen
    current_friend = authenticate_friend!
    post = load_post
    authorize!(post)
    post.views.find_or_create_by!(friend: current_friend)
    render(json: { "authorId" => post.author_id })
  end

  # POST /posts/:id/mark_replied?friend_token=...
  def mark_replied
    current_friend = authenticate_friend!
    post = load_post
    authorize!(post)
    post.reply_receipts.create!(friend: current_friend)
    render(json: { "authorId" => post.author_id })
  end

  private

  sig { params(scope: Post::PrivateRelation).returns(Post) }
  def load_post(scope: Post.all)
    scope.find(params.fetch(:id))
  end
end
