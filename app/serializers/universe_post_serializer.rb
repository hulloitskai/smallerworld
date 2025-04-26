# typed: true
# frozen_string_literal: true

class UniversePostSerializer < PostSerializer
  # == Configuration
  object_as :post

  # == Associations
  has_one :author, serializer: AuthorSerializer
end
