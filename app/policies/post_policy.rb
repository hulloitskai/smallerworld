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
      post.visibility == :public
    end
  end

  def share?
    post = T.cast(record, Post)
    if (friend = self.friend)
      user = friend.user!
      post.author! == user &&
        (post.visibility == :public || user.allow_friend_sharing?)
    elsif (user = self.user)
      user == post.author!
    else
      false
    end
  end

  def manage?
    post = T.cast(record, Post)
    post.author! == user!
  end

  def mark_seen?
    post = T.cast(record, Post)
    post.author! == friend!.user!
  end

  def mark_replied?
    post = T.cast(record, Post)
    post.author! == friend!.user!
  end

  # == Scopes
  relation_scope do |relation|
    relation = T.cast(relation, Post::PrivateRelation)
    if (friend = self.friend)
      posts = relation.not_hidden_from(friend)
      if friend.chosen_family?
        posts.visible_to_chosen_family
      else
        posts.visible_to_friends
      end
    elsif (user = self.user)
      relation.where(author: user)
    else
      relation.visible_to_public
    end
  end
end
