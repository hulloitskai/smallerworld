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
          :sharer,
        ))
        post = share.post!
        world = post.world!
        repliers = PostReplyReceipt
          .where(post:, replier_type: "Friend")
          .distinct
          .count(:replier_id)
        if (actor = current_friend || current_user)
          seen = actor.post_views.exists?(post:)
          replied = actor.post_reply_receipts.exists?(post:)
        end
        post = WorldPost.new(
          post:,
          repliers:,
          seen: seen || false,
          replied: replied || false,
        )
        friend_sharer = scoped do
          sharer = share.sharer!
          sharer if sharer.is_a?(Friend)
        end
        if (user = current_user)
          invitation_requested = world
            .join_requests
            .exists?(phone_number: user.phone_number)
        end
        render(inertia: "PostSharePage", props: {
          world: WorldSerializer.one(world),
          post: WorldPostSerializer.one(post),
          sharer: FriendProfileSerializer.one_if(friend_sharer),
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
