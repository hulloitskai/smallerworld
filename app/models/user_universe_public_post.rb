# typed: true
# frozen_string_literal: true

class UserUniversePublicPost < T::Struct
  extend T::Sig
  include UserUniversePost

  # == Properties ==

  const :post, T.any(Post, MaskedPost)
  delegate :world, to: :post

  const :seen, T::Boolean

  # == Methods ==

  sig { override.returns(String) }
  def user_universe_post_type = "public"
end
