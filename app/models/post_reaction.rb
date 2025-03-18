# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: post_reactions
#
#  id         :uuid             not null, primary key
#  emoji      :string           not null
#  created_at :datetime         not null
#  friend_id  :uuid             not null
#  post_id    :uuid             not null
#
# Indexes
#
#  index_post_reactions_on_friend_id  (friend_id)
#  index_post_reactions_on_post_id    (post_id)
#  index_post_reactions_uniqueness    (post_id,friend_id,emoji) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (friend_id => friends.id)
#  fk_rails_...  (post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class PostReaction < ApplicationRecord
  # == Associations
  belongs_to :post, inverse_of: :reactions
  belongs_to :friend

  sig { returns(Friend) }
  def friend!
    friend or raise ActiveRecord::RecordNotFound, "Missing friend"
  end

  # == Validations
  validates :emoji, presence: true, uniqueness: { scope: %i[post friend] }
end
