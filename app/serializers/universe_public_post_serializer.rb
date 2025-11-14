# typed: true
# frozen_string_literal: true

class UniversePublicPostSerializer < PostSerializer
  # == Configuration ==

  object_as :post

  # == Type ==

  attribute :universe_post_type, type: '"public"' do
    "public"
  end

  # == Associations ==

  has_one :author, serializer: AuthorSerializer
end
