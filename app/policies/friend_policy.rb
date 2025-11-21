# typed: true
# frozen_string_literal: true

class FriendPolicy < ApplicationPolicy
  # == Rules ==

  def manage?
    friend = T.let(record, Friend)
    friend.world_owner! == user!
  end
end
