# typed: true
# frozen_string_literal: true

class PostReactionSerializer < ApplicationSerializer
  # == Attributes ==

  identifier
  attributes :friend_id, :emoji
end
