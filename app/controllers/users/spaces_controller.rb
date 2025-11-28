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
          spaces = authorized_scope(current_user.owned_spaces)
            .with_attached_icon
          render(json: {
            spaces: SpaceSerializer.many(spaces),
          })
        end
      end
    end

    # POST /world/spaces
    def create
      respond_to do |format|
        format.json do
          current_user = authenticate_user!
          space_params = params.expect(space: %i[name description icon])
          space = current_user.owned_spaces.build(**space_params)
          if space.save
            render(json: {
              space: SpaceSerializer.one(space),
            })
          else
            render(
              json: {
                errors: space.form_errors,
              },
              status: :unprocessable_content,
            )
          end
        end
      end
    end

    # PUT /world/spaces/:id
    def update
      respond_to do |format|
        format.json do
          space = find_space!
          authorize!(space)
          space_params = params.expect(space: %i[name description icon])
          if space.update(space_params)
            render(json: {
              space: SpaceSerializer.one(space),
            })
          end
        end
      end
    end

    private

    # == Helpers ==

    sig { returns(Space) }
    def find_space!
      Space.find(params.fetch(:id))
    end
  end
end
