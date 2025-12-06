# typed: true
# frozen_string_literal: true

class PostPolicy < ApplicationPolicy
  # == Rules ==

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

  alias_rule :print?, to: :show?

  def share?
    post = T.cast(record, Post)
    if (friend = self.friend)
      world = friend.world!
      friend_can_view?(post, friend) &&
        (post.visibility == :public || world.allow_friend_sharing?)
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
    if (friend = self.friend)
      friend_can_view?(post, friend)
    else
      post.visibility == :public
    end
  end

  def mark_replied?
    post = T.cast(record, Post)
    friend_can_view?(post, friend!)
  end

  # == Scopes ==

  relation_scope do |relation|
    relation = T.cast(relation, Post::PrivateRelation)
    if (friend = self.friend)
      relation.visible_to(friend)
    elsif (user = self.user)
      associated_friends = user.associated_friends
      relation.where(author: user)
        .or(relation.publicly_visible)
        .or(
          relation
            .visible_to_friends
            .where(world_id: associated_friends.select(:world_id))
            .where(
              "NOT hidden_from_ids && ARRAY(?)",
              associated_friends.select(:id),
            ),
        )
        .or(
          relation.secretly_visible
          .where(world_id: associated_friends.select(:world_id))
          .where(
            "visible_to_ids && ARRAY(?)",
            associated_friends.select(:id),
          ),
        )
    else
      relation.publicly_visible
    end
  end

  private

  # == Helpers ==

  sig { params(post: Post, friend: Friend).returns(T::Boolean) }
  def friend_can_view?(post, friend)
    return false unless friend.world_owner! == post.author!
    return false if post.hidden_from_ids.include?(friend.id)

    case post.visibility.to_sym
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
