# typed: true
# frozen_string_literal: true

class WorldPublicPostSerializer < PostSerializer
  # == Configuration ==

  object_as :post

  # == Type ==

  attribute :world_post_type, type: '"public"' do
    "public"
  end

  # == Attributes ==

  attributes repliers: { type: :number },
             seen: { type: :boolean }
end
