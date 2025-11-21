# typed: true
# frozen_string_literal: true

class UserUniverseAuthorPostSerializer < UserUniversePublicPostSerializer
  # == Configuration ==

  object_as :post

  # == Type ==

  attribute :universe_post_type, type: '"author"' do
    "author"
  end

  # == Attributes ==

  attributes :updated_at, hidden_from_ids: { type: "string[]" }

  # == Associations ==

  has_one :encouragement, serializer: EncouragementSerializer, nullable: true
end
