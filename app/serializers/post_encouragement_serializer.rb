# typed: true
# frozen_string_literal: true

class PostEncouragementSerializer < ApplicationSerializer
  # == Configuration
  object_as :encouragement

  # == Attributes
  identifier
  attributes :emoji, :message
end
