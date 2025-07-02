# typed: true
# frozen_string_literal: true

class JoinRequestPolicy < ApplicationPolicy
  # == Rules
  def manage?
    join_request = T.let(record, JoinRequest)
    join_request.user! == user!
  end
end
