# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: post_stickers
#
#  id                  :uuid             not null, primary key
#  emoji               :string           not null
#  relative_position_x :float            not null
#  relative_position_y :float            not null
#  created_at          :datetime         not null
#  friend_id           :uuid             not null
#  post_id             :uuid             not null
#
# Indexes
#
#  index_post_stickers_on_emoji      (emoji)
#  index_post_stickers_on_friend_id  (friend_id)
#  index_post_stickers_on_post_id    (post_id)
#
# Foreign Keys
#
#  fk_rails_...  (friend_id => friends.id)
#  fk_rails_...  (post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class PostSticker < ApplicationRecord
  # == Associations
  belongs_to :post
  belongs_to :friend

  sig { returns(Friend) }
  def friend!
    friend or raise ActiveRecord::RecordNotFound, "Missing friend"
  end

  # == Attributes
  sig { returns(Position) }
  def relative_position
    Position.new(x: relative_position_x, y: relative_position_y)
  end

  sig do
    params(position: T.any(
      Position,
      T::Hash[T.any(Symbol, String), Float],
    )).void
  end
  def relative_position=(position)
    if position.is_a?(Position)
      self.relative_position_x = position.x
      self.relative_position_y = position.y
    else
      position.with_indifferent_access => {x:, y:}
      self.relative_position_x = x
      self.relative_position_y = y
    end
  end

  # == Validations
  validates :relative_position_x,
            :relative_position_y,
            numericality: {
              greater_than_or_equal_to: 0,
              less_than_or_equal_to: 1,
            }
end
