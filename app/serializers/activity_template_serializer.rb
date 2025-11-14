# typed: true
# frozen_string_literal: true

class ActivityTemplateSerializer < ApplicationSerializer
  # == Attributes ==

  attributes id: { type: :string },
             emoji: { type: :string, nullable: true },
             name: { type: :string },
             description: { type: :string }
end
