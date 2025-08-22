# typed: true
# frozen_string_literal: true

class JoinRequestsController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world/join_requests
  def index
    current_user = authenticate_user!
    respond_to do |format|
      format.html do
        render(inertia: "JoinRequestsPage")
      end
      format.json do
        join_requests = current_user.join_requests.pending.reverse_chronological
        render(json: {
          "joinRequests" => JoinRequestSerializer.many(join_requests),
        })
      end
    end
  end

  # DELETE /join_requests/:id
  def destroy
    join_request = load_join_request
    authorize!(join_request)
    join_request.destroy!
    render(json: {})
  end

  private

  sig { params(scope: JoinRequest::PrivateRelation).returns(JoinRequest) }
  def load_join_request(scope: JoinRequest.all)
    scope.find(params.fetch(:id))
  end
end
