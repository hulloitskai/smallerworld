# typed: true
# frozen_string_literal: true

class ShortlinkService < ApplicationService
  class UrlHelpers
    extend T::Sig
    include Routing

    private

    # == Helpers
    sig { override.returns(T::Hash[Symbol, T.untyped]) }
    def default_url_options
      ShortlinkService.shortlink_url_options
    end
  end

  # == Methods
  sig { returns(T::Hash[Symbol, T.untyped]) }
  def self.shortlink_url_options
    if Rails.env.production?
      { host: "https://smlr.world" }
    else
      {}
    end
  end

  sig { returns(UrlHelpers) }
  def self.url_helpers
    @url_helpers ||= UrlHelpers.new
  end
end
