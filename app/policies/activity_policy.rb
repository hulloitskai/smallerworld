# typed: true
# frozen_string_literal: true

class ActivityPolicy < ApplicationPolicy
  # == Rules ==

  def manage?
    activity = T.cast(record, Activity)
    activity.world_owner! == user!
  end

  # == Scopes ==

  relation_scope do |relation|
    relation = T.cast(relation, Activity::PrivateRelation)
    if (user = self.user)
      relation.where(world: user.world)
    else
      relation.none
    end
  end
end
