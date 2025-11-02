# typed: true
# frozen_string_literal: true

require "inertia_rails"

module InertiaRails
  # NOTE: Include asset helper in controller
  module Controller
    extend ActiveSupport::Concern
    extend T::Sig
    extend T::Helpers

    requires_ancestor { ActionController::Base }

    # == Included
    remove_instance_variable :@_included_block
    included do
      T.bind(self, T.class_of(ActionController::Base))

      helper Helper
    end
  end
end
