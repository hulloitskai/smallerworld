# typed: true
# frozen_string_literal: true

class SpacePolicy < ApplicationPolicy
  # == Rules ==

  def manage?
    space = T.cast(record, Space)
    space.owner! == user!
  end

  def post?
    true
  end

  # == Scopes ==

  relation_scope do |relation|
    relation = T.cast(relation, Space::PrivateRelation)
    if (user = self.user)
      relation.where(owner: user)
    else
      relation.none
    end
  end
end
