# typed: true
# frozen_string_literal: true

class FriendSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :name,
             :emoji,
             :access_token,
             notifiable: { type: :boolean },
             paused?: { as: :paused, type: :boolean }
end
