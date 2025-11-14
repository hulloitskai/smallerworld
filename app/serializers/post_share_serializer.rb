# typed: true
# frozen_string_literal: true

class PostShareSerializer < ApplicationSerializer
  # == Attributes ==

  identifier
  attributes share_snippet: { type: :string }
end
