# typed: true
# frozen_string_literal: true

class PostSharesController < ApplicationController
  # == Actions ==

  # GET /post_shares/:id
  def show
    respond_to do |format|
      format.html do
        share = find_share!(scope: PostShare.includes(
          :post,
          :post_author,
          :sharer,
        ))
        post = share.post!
        world = post.world!
        repliers = PostReplyReceipt
          .where(post:)
          .distinct
          .count(:friend_id)
        public_post = WorldPublicPost.new(post:, repliers:)
        sharer = share.sharer!
        if (user = current_user)
          invitation_requested = world
            .join_requests
            .exists?(phone_number: user.phone_number)
        end
        render(inertia: "PostSharePage", props: {
          world: WorldSerializer.one(world),
          post: WorldPublicPostSerializer.one(public_post),
          sharer: (FriendProfileSerializer.one(sharer) if sharer.is_a?(Friend)),
          "invitationRequested" => invitation_requested || false,
        })
      end
    end
  end

  private

  # == Helpers ==

  sig { params(scope: PostShare::PrivateRelation).returns(PostShare) }
  def find_share!(scope: PostShare.all)
    scope.find(params.fetch(:id))
  end
end
