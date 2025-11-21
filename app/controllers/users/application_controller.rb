# typed: true
# frozen_string_literal: true

module Users
  class ApplicationController < ::ApplicationController
    # == Filters ==

    before_action :authenticate_user!

    private

    # == Helpers ==

    sig { params(scope: World::PrivateRelation).returns(T.nilable(World)) }
    def current_world(scope: World.all)
      current_user = authenticate_user!
      scope.find_by(owner: current_user)
    end

    sig { params(scope: World::PrivateRelation).returns(World) }
    def current_world!(scope: World.all)
      current_user = authenticate_user!
      scope.find_by!(owner: current_user)
    end
  end
end
