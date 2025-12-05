# typed: true
# frozen_string_literal: true

class PromptDeckSerializer < ApplicationSerializer
  # == Attributes ==

  attributes id: { type: :string },
             name: { type: :string },
             edition: { type: :string, nullable: true },
             text_color: { type: :string },
             background_color: { type: :string }
end
