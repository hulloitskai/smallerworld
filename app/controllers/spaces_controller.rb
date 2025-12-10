# typed: true
# frozen_string_literal: true

class SpacesController < ApplicationController
  # == Actions ==

  # GET /spaces/:id
  def show
    respond_to do |format|
      format.html do
        space = find_space!
        if space.friendly_id != space_id!
          return redirect_to(space_path(space), status: :found)
        end

        user_world = current_user&.world
        render(inertia: "SpacePage", world_theme: "cloudflow", props: {
          space: SpaceSerializer.one(space),
          "userWorld" => WorldSerializer.one_if(user_world),
        })
      end
    end
  end

  # GET /spaces/new
  def new
    respond_to do |format|
      format.html do
        render(inertia: "NewSpacePage", world_theme: "cloudflow")
      end
    end
  end

  # GET /spaces/:id/edit
  def edit
    respond_to do |format|
      format.html do
        space = find_space!
        render(inertia: "EditSpacePage", world_theme: "cloudflow", props: {
          space: SpaceSerializer.one(space),
        })
      end
    end
  end

  private

  # == Helpers ==

  sig { returns(String) }
  def space_id!
    params.fetch(:id)
  end

  sig { params(scope: Space::PrivateRelation).returns(Space) }
  def find_space!(scope: Space.all)
    scope.friendly.find(space_id!)
  end
end
