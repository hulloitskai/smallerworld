# typed: true
# frozen_string_literal: true

class UserUniverseAuthorPost < T::Struct
  extend T::Sig
  include UserUniversePost

  # == Properties ==

  const :post, Post
  delegate :updated_at, :hidden_from_ids, :world, :encouragement, to: :post

  # == Methods ==

  sig { override.returns(String) }
  def user_universe_post_type = "author"
end
