# typed: true
# frozen_string_literal: true

class LocalUniversePostSerializer < ApplicationSerializer
  # == Attributes
  attributes associated_friend_access_token: { type: :string, nullable: true }

  # == Associations
  flat_one :post, serializer: UniversePostSerializer
end
