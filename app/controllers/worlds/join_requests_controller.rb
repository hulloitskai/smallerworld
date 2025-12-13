# typed: true
# frozen_string_literal: true

module Worlds
  class JoinRequestsController < ApplicationController
    # POST /worlds/:world_id/join_requests
    def create
      respond_to do |format|
        format.json do
          world = find_world!
          join_request_params = params.expect(join_request: %i[
            name
            phone_number
          ])
          phone_number = join_request_params.delete(:phone_number)
          join_request = world.join_requests
            .find_or_initialize_by(phone_number:)
          if join_request.persisted? &&
              world.friends.exists?(join_request_id: join_request.id) ||
              world.friends.exists?(phone_number:)
            raise "You have already been invited"
          end

          if join_request.update(join_request_params)
            render(json: {
              "joinRequest" => JoinRequestSerializer.one(join_request)
            })
          else
            render(
              json: { errors: join_request.form_errors },
              status: :unprocessable_content,
            )
          end
        end
      end
    end
  end
end
