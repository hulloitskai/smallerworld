# typed: true
# frozen_string_literal: true

class InvitationPolicy < ApplicationPolicy
  # == Rules
  def manage?
    friend = T.let(record, Friend)
    friend.user == user!
  end
end
