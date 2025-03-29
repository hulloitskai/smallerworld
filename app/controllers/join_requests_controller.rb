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
      format.any do
        join_requests = current_user.join_requests.pending.reverse_chronological
        render(json: {
          "joinRequests" => JoinRequestSerializer.many(join_requests),
        })
      end
    end
  end
end
