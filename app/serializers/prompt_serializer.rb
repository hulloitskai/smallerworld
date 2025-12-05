# typed: true
# frozen_string_literal: true

class PromptSerializer < ApplicationSerializer
  # == Attributes ==

  attributes id: { type: :string },
             prompt: { type: :string }
end
