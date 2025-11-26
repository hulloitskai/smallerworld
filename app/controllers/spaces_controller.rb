# typed: true
# frozen_string_literal: true

class SpacesController < ApplicationController
  # == Actions ==

  # GET /spaces/:id
  def show
    respond_to do |format|
      format.html do
        space = find_space!
        render(inertia: "SpacePage", props: {
          space: SpaceSerializer.one(space),
        })
      end
    end
  end

  private

  # == Helpers ==

  sig { params(scope: Space::PrivateRelation).returns(Space) }
  def find_space!(scope: Space.all)
    scope.friendly.find(params.fetch(:id))
  end
end
