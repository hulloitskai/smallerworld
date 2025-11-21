# typed: true
# frozen_string_literal: true

class InvitationPolicy < ApplicationPolicy
  # == Rules ==

  def manage?
    invitation = T.let(record, Invitation)
    invitation.world_owner! == user!
  end
end
