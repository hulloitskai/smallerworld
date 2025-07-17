# typed: true
# frozen_string_literal: true

class ActivityTemplateSerializer < ApplicationSerializer
  # == Attributes
  identifier type: :string
  attributes emoji: { type: :string, nullable: true },
             name: { type: :string },
             description: { type: :string }
end
