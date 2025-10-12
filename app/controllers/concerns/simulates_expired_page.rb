# typed: true
# frozen_string_literal: true

module SimulatesExpiredPage
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  # == Annotations
  requires_ancestor { ActionController::Base }
  requires_ancestor { ActionController::RequestForgeryProtection }

  private

  sig do
    params(session: T.nilable(ActionDispatch::Request::Session))
      .returns(String)
  end
  def global_csrf_token(session = nil)
    should_fake_csrf? ? "dummy" : super
  end

  # == Helpers
  sig { returns(T::Boolean) }
  def testing_expired_page?
    params[:simulate_expired_page].truthy?
  end

  sig { returns(T::Boolean) }
  def should_fake_csrf?
    testing_expired_page? && !request.inertia?
  end
end
