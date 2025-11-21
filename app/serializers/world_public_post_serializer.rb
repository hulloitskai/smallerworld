# typed: true
# frozen_string_literal: true

class WorldPublicPostSerializer < PostSerializer
  # == Configuration ==

  object_as :post

  # == Type ==

  attribute :user_post_type, type: '"public"' do
    "public"
  end

  # == Attributes ==

  attributes repliers: { type: :number }
end
