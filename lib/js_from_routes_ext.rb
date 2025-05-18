# typed: true
# frozen_string_literal: true

return unless Rails.env.development?

module JsFromRoutes
  class << self
    # NOTE: Patch the `generate!` method to clean the output folder before
    # generating new routes if JS_FROM_ROUTES_FORCE is set.
    module CleanOutputFolderBeforeGenerate
      extend T::Sig
      extend T::Helpers

      requires_ancestor { T.class_of(JsFromRoutes) }

      def generate!(...)
        if ENV["JS_FROM_ROUTES_FORCE"] &&
            (output_folder = config.output_folder.presence)
          FileUtils.rm_rf(Dir.glob("#{output_folder}/*"))
        end
        super
      end
    end
    prepend CleanOutputFolderBeforeGenerate
  end
end
