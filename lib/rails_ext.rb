# typed: true
# frozen_string_literal: true

require "sorbet-runtime"
require "rails"

module Rails
  # NOTE: Add predicates to determine if Rails is running a console or a server.
  module RuntimeContextHelpers
    extend T::Sig
    extend T::Helpers

    requires_ancestor { T.class_of(Rails) }

    # == Methods
    sig { returns(T::Boolean) }
    def server?
      const_defined?(:Server)
    end

    sig { returns(T::Boolean) }
    def console?
      const_defined?(:Console)
    end

    sig { returns(T::Boolean) }
    def test?
      const_defined?(:TestUnitReporter)
    end
  end
  extend RuntimeContextHelpers
end

module ActionController
  class ParameterMissing
    # NOTE: Correct error message capitalization.
    module CorrectMessageCapitalization
      def initialize(param, keys = nil)
        @param = param
        @keys = keys
        super("Param is missing or the value is empty or invalid: #{param}")
      end
    end
    include CorrectMessageCapitalization
  end
end

module ActiveStorage
  class Analyzer::ImageAnalyzer::Vips
    module CorrectImageDimensions
      extend T::Sig
      extend T::Helpers

      requires_ancestor { Kernel }

      sig { params(image: Vips::Image).returns(T::Boolean) }
      def rotated_image?(image)
        orientation = image.get("exif-ifd0-Orientation").to_i
        orientation.between?(5, 8)
      rescue ::Vips::Error
        false
      end
    end
    prepend CorrectImageDimensions
  end
end
