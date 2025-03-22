# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: post_reply_receipts
#
#  id         :uuid             not null, primary key
#  created_at :datetime         not null
#  friend_id  :uuid             not null
#  post_id    :uuid             not null
#
# Indexes
#
#  index_post_reply_receipts_on_friend_id  (friend_id)
#  index_post_reply_receipts_on_post_id    (post_id)
#
# Foreign Keys
#
#  fk_rails_...  (friend_id => friends.id)
#  fk_rails_...  (post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class PostReplyReceipt < ApplicationRecord
  # == Associations
  belongs_to :post
  belongs_to :friend
end
