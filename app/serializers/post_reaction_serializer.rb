# typed: true
# frozen_string_literal: true

class PostReactionSerializer < ApplicationSerializer
  # == Attributes ==

  identifier
  attributes :reactor_id, :reactor_type, :emoji
end
