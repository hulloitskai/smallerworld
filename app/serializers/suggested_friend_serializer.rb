# typed: true
# frozen_string_literal: true

class SuggestedFriendSerializer < ApplicationSerializer
  # == Attributes
  identifier type: :string
  attributes name: { type: :string }, phone_number: { type: :string }
end
