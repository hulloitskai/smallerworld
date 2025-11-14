# typed: true
# frozen_string_literal: true

class ActivityPolicy < ApplicationPolicy
  # == Rules ==

  def manage?
    activity = T.cast(record, Activity)
    activity.user! == user!
  end
end
