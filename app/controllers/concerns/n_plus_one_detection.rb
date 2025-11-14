# typed: true
# frozen_string_literal: true

module NPlusOneDetection
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  requires_ancestor { ActionController::Base }

  included do
    T.bind(self, T.class_of(ActionController::Base))

    # == Filters ==

    around_action :n_plus_one_detection if defined?(Prosopite)
  end

  private

  # == Filter Handlers ==

  sig { params(block: T.proc.void).void }
  def n_plus_one_detection(&block)
    Prosopite.scan
    yield
  ensure
    Prosopite.finish
  end
end
