# typed: true
# frozen_string_literal: true

module UserUniversePost
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  abstract!

  # == Interface ==

  sig { abstract.returns(String) }
  def user_universe_post_type; end
end
