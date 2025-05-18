# typed: true
# frozen_string_literal: true

module InertiaRails
  class Middleware
    # NOTE: Ignore XSRF header (rely on X-CSRF-Token instead).
    class InertiaRailsRequest
      module IgnoreXSRFHeader
        def copy_xsrf_to_csrf!; end
      end
      include IgnoreXSRFHeader
    end
  end
end
