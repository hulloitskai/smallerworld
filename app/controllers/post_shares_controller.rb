# typed: true
# frozen_string_literal: true

class PostSharesController < ApplicationController
  # == Actions
  # GET /post_shares/:id
  def show
    share = load_share(scope: PostShare.includes(:post, :post_author, :sharer))
    post = share.post!
    repliers = PostReplyReceipt
      .where(post:)
      .distinct
      .count(:friend_id)
    user_post = UserPost.new(post:, seen: false, replied: false, repliers:)
    render(inertia: "PostSharePage", props: {
      user: UserSerializer.one(share.post_author!),
      post: UserPostSerializer.one(user_post),
      sharer: FriendProfileSerializer.one(share.sharer!),
    })
  end

  private

  # == Helpers
  sig { params(scope: PostShare::PrivateRelation).returns(PostShare) }
  def load_share(scope: PostShare.all)
    scope.find(params.fetch(:id))
  end
end
