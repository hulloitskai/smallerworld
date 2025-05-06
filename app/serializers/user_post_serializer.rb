# typed: true
# frozen_string_literal: true

class UserPostSerializer < PostSerializer
  # == Configuration
  object_as :post

  # == Attributes
  attributes replied: { type: :boolean, nullable: true },
             seen: { type: :boolean, nullable: true },
             repliers: { type: :number }
end
