# typed: true
# frozen_string_literal: true

class PostSharesController < ApplicationController
  # == Actions ==

  # GET /post_shares/:id
  def show
    respond_to do |format|
      format.html do
        share = find_share(scope: PostShare.includes(
          :post,
          :post_author,
          :sharer,
        ))
        user = share.post_author!
        post = share.post!
        repliers = PostReplyReceipt
          .where(post:)
          .distinct
          .count(:friend_id)
        public_post = UserPublicPost.new(post:, repliers:)
        sharer = share.sharer!
        if (current_user = self.current_user)
          invitation_requested = user
            .join_requests
            .exists?(phone_number: current_user.phone_number)
        end
        render(inertia: "PostSharePage", props: {
          user: UserSerializer.one(user),
          post: UserPublicPostSerializer.one(public_post),
          sharer: (FriendProfileSerializer.one(sharer) if sharer.is_a?(Friend)),
          "invitationRequested" => invitation_requested || false,
        })
      end
    end
  end

  private

  # == Helpers ==

  sig { params(scope: PostShare::PrivateRelation).returns(PostShare) }
  def find_share(scope: PostShare.all)
    scope.find(params.fetch(:id))
  end
end
