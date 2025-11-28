# typed: true
# frozen_string_literal: true

class UniversePostAssociatedFriendSerializer < ApplicationSerializer
  # == Attributes ==

  attributes id: { type: :string },
             access_token: { type: :string },
             world_reply_to_number: { type: :string }
end
