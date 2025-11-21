# typed: true
# frozen_string_literal: true

class PostReactorSerializer < ApplicationSerializer
  # == Attributes ==

  identifier type: :string
  attributes name: { type: :string },
             emoji: { type: :string, nullable: true }
end
