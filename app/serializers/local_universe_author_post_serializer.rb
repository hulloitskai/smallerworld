# typed: true
# frozen_string_literal: true

class LocalUniverseAuthorPostSerializer < LocalUniversePublicPostSerializer
  # == Configuration ==

  object_as :post

  # == Type ==

  attribute :local_universe_post_type, type: '"author"' do
    "author"
  end

  # == Attributes ==

  attributes :updated_at, hidden_from_ids: { type: "string[]" }

  # == Associations ==

  has_one :encouragement, serializer: EncouragementSerializer, nullable: true
end
