# typed: true
# frozen_string_literal: true

class ShortlinkService < ApplicationService
  sig { returns(T::Hash[Symbol, T.untyped]) }
  def self.shortlink_url_options
    if Rails.env.production?
      { host: "https://smlr.world" }
    else
      {}
    end
  end
end
