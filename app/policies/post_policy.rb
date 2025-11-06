# typed: true
# frozen_string_literal: true

class PostPolicy < ApplicationPolicy
  # == Rules
  def show?
    post = T.cast(record, Post)
    if (friend = self.friend)
      friend_can_view?(post, friend)
    elsif (user = self.user)
      user == post.author!
    else
      post.visibility == :public
    end
  end

  def share?
    post = T.cast(record, Post)
    if (friend = self.friend)
      user = friend.user!
      friend_can_view?(post, friend) &&
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
    friend_can_view?(post, friend!)
  end

  def mark_replied?
    post = T.cast(record, Post)
    friend_can_view?(post, friend!)
  end

  # == Scopes
  relation_scope do |relation|
    relation = T.cast(relation, Post::PrivateRelation)
    if (friend = self.friend)
      relation.visible_to(friend)
    elsif (user = self.user)
      relation.where(author: user)
    else
      relation.publicly_visible
    end
  end

  private

  sig { params(post: Post, friend: Friend).returns(T::Boolean) }
  def friend_can_view?(post, friend)
    return false unless friend.user! == post.author!
    return false if post.hidden_from_ids.include?(friend.id)

    case post.visibility
    when :public, :friends
      true
    when :chosen_family
      friend.chosen_family?
    when :secret
      post.visible_to_ids.include?(friend.id)
    else
      false
    end
  end
end
