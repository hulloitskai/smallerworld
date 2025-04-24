# typed: true
# frozen_string_literal: true

module NonCanonicalHostConstraint
  extend T::Sig

  sig { params(request: ActionDispatch::Request).returns(T::Boolean) }
  def self.matches?(request)
    return false unless Rails.env.production?

    hostname, port = Rails.application.default_url_options
      .values_at(:host, :port)
    canonical_host = [hostname, port].compact_blank.join(":")
    request.host != canonical_host
  end
end
