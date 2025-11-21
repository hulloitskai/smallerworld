# typed: true
# frozen_string_literal: true

module Users
  class SpacesController < ApplicationController
    # == Actions ==

    # GET /world/spaces
    def index
      respond_to do |format|
        format.html do
          render(inertia: "UserSpacesPage", props: {
            "userWorld" => WorldSerializer.one_if(current_world),
          })
        end
        format.json do
          current_user = authenticate_user!
          spaces = authorized_scope(current_user.spaces)
          render(json: {
            spaces: SpaceSerializer.many(spaces),
          })
        end
      end
    end
  end
end
