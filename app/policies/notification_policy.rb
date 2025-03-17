# typed: true
# frozen_string_literal: true

class NotificationPolicy < ApplicationPolicy
  # == Scopes
  relation_scope do |relation|
    if (user = self.user)
      relation.where(recipient: user)
    elsif (friend = self.friend)
      relation.where(recipient: friend)
    else
      relation.none
    end
  end
end
