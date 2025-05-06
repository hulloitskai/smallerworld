# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: post_views
#
#  id         :uuid             not null, primary key
#  created_at :datetime         not null
#  friend_id  :uuid             not null
#  post_id    :uuid             not null
#
# Indexes
#
#  index_post_views_on_friend_id  (friend_id)
#  index_post_views_on_post_id    (post_id)
#  index_post_views_uniqueness    (friend_id,post_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (friend_id => friends.id)
#  fk_rails_...  (post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class PostView < ApplicationRecord
  # == Associations
  belongs_to :post, inverse_of: :views
  belongs_to :friend

  # == Validations
  validates :friend, uniqueness: { scope: :post }
end
