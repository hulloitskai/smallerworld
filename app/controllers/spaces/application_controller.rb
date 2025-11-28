# typed: true
# frozen_string_literal: true

module Spaces
  class ApplicationController < ::ApplicationController
    private

    # == Helpers ==

    sig { returns(Space) }
    def find_space!
      Space.find(params.fetch(:space_id))
    end
  end
end
