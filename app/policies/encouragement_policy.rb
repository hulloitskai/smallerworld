# typed: true
# frozen_string_literal: true

class EncouragementPolicy < ApplicationPolicy
  # == Rules ==

  def show?
    encouragement = T.cast(record, Encouragement)
    if (friend = self.friend)
      encouragement.friend! == friend
    elsif (user = self.user)
      encouragement.world_owner! == user
    else
      false
    end
  end
end
