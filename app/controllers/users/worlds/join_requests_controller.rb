# typed: true
# frozen_string_literal: true

module Users::Worlds
  class JoinRequestsController < ApplicationController
    # == Actions ==

    # GET /world/join_requests
    def index
      respond_to do |format|
        format.html do
          world = current_world or next redirect_to(
            new_registration_path,
            notice: "create a world to continue",
          )
          render(
            inertia: "UserWorldJoinRequestsPage",
            world_theme: world.theme,
            props: {
              world: WorldSerializer.one(world),
            },
          )
        end
        format.json do
          world = current_world!
          join_requests = world.join_requests
            .pending
            .reverse_chronological
          render(json: {
            world: WorldSerializer.one(world),
            "pendingJoinRequests" => JoinRequestSerializer.many(join_requests),
          })
        end
      end
    end

    # DELETE /world/join_requests/:id
    def destroy
      respond_to do |format|
        format.json do
          join_request = find_join_request!
          authorize!(join_request)
          join_request.destroy!
          render(json: {})
        end
      end
    end

    private

    # == Helpers ==

    sig { params(scope: JoinRequest::PrivateRelation).returns(JoinRequest) }
    def find_join_request!(scope: JoinRequest.all)
      scope.find(params.fetch(:id))
    end
  end
end
