# typed: true
# frozen_string_literal: true

class UserPostSerializer < ApplicationSerializer
  # == Attributes
  attributes replied: { type: :boolean, nullable: true },
             seen: { type: :boolean, nullable: true },
             repliers: { type: :number }

  # == Associations
  flat_one :post, serializer: PostSerializer
end
