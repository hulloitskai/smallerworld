# typed: true
# frozen_string_literal: true

class Current < ActiveSupport::CurrentAttributes
  # == Attributes ==

  attribute :session
  delegate :user, to: :session, allow_nil: true
end
