# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: post_reply_receipts
#
#  id                   :uuid             not null, primary key
#  replier_type         :string           not null
#  created_at           :datetime         not null
#  deprecated_friend_id :uuid
#  post_id              :uuid             not null
#  replier_id           :uuid             not null
#
# Indexes
#
#  index_post_reply_receipts_on_deprecated_friend_id  (deprecated_friend_id)
#  index_post_reply_receipts_on_post_id               (post_id)
#  index_post_reply_receipts_on_replier               (replier_type,replier_id)
#
# Foreign Keys
#
#  fk_rails_...  (post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class PostReplyReceipt < ApplicationRecord
  # == Associations ==

  belongs_to :post
  belongs_to :replier, polymorphic: true
end
