# typed: true
# frozen_string_literal: true

class PostReactionPolicy < ApplicationPolicy
  # == Rules
  def manage?
    reaction = T.cast(record, PostReaction)
    reaction.friend! == friend!
  end

  # == Scopes
  relation_scope do |relation|
    if (friend = self.friend)
      relation.joins(:post).where(posts: { author: friend.user! })
    elsif (user = self.user)
      relation.joins(:post).where(posts: { author: user })
    else
      relation.joins(:post).where(posts: { visibility: "public" })
    end
  end
end
