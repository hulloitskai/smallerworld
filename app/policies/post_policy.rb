# typed: true
# frozen_string_literal: true

class PostPolicy < ApplicationPolicy
  # == Rules
  def show?
    post = T.cast(record, Post)
    if (user = self.user)
      user == post.author!
    elsif (friend = self.friend)
      friend.user! == post.author!
    else
      false
    end
  end

  def manage?
    post = T.cast(record, Post)
    post.author! == user!
  end

  # == Scopes
  relation_scope do |relation|
    if (user = self.user)
      relation.where(author: user)
    elsif (friend = self.friend)
      relation.where(author: friend.user!)
    else
      relation.none
    end
  end
end
