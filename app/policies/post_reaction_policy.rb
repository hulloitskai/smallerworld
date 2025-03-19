# typed: true
# frozen_string_literal: true

class PostReactionPolicy < RelaxedPolicy
  # == Rules
  def manage?
    reaction = T.cast(record, PostReaction)
    reaction.friend! == friend!
  end
end
