# typed: true
# frozen_string_literal: true

class PostViewSerializer < PostSerializer
  # == Configuration
  object_as :post

  # == Attributes
  attributes replied: { type: :boolean, nullable: true }
  attribute :repliers, type: :number do
    post.repliers.count
  end
end
