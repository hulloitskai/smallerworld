# typed: true
# frozen_string_literal: true

class PostPromptSerializer < PromptSerializer
  # == Configuration ==

  object_as :prompt

  # == Associations ==

  has_one :deck, serializer: PromptDeckSerializer
end
