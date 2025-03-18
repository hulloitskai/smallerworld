# typed: true
# frozen_string_literal: true

class PushSubscriptionPolicy < ApplicationPolicy
  # == Rules
  def create?
    (friend || user).present?
  end
end
