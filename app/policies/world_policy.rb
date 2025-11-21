# typed: true
# frozen_string_literal: true

class WorldPolicy < ApplicationPolicy
  # == Rules ==

  def manage?
    world = T.let(record, World)
    world.owner! == user!
  end
end
