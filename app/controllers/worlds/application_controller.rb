# typed: true
# frozen_string_literal: true

module Worlds
  class ApplicationController < ::ApplicationController
    # == Helpers ==

    sig { params(scope: World::PrivateRelation).returns(World) }
    def find_world!(scope: World.all)
      scope.friendly.find(params.fetch(:world_id))
    end
  end
end
