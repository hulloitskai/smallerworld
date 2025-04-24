# typed: true
# frozen_string_literal: true

module SubdomainConstraint
  extend T::Sig

  sig { params(request: ActionDispatch::Request).returns(T::Boolean) }
  def self.matches?(request)
    Rails.env.production? && request.subdomain.present?
  end
end
