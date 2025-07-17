# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: activity_coupons
#
#  id          :uuid             not null, primary key
#  expires_at  :datetime         not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  activity_id :uuid             not null
#  friend_id   :uuid             not null
#
# Indexes
#
#  index_activity_coupons_on_activity_id  (activity_id)
#  index_activity_coupons_on_expires_at   (expires_at)
#  index_activity_coupons_on_friend_id    (friend_id)
#
# Foreign Keys
#
#  fk_rails_...  (activity_id => activities.id)
#  fk_rails_...  (friend_id => friends.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class ActivityCoupon < ApplicationRecord
  # == Attributes
  attribute :expires_at, default: -> { 1.month.from_now }

  # == Associations
  belongs_to :friend
  belongs_to :activity

  # == Scopes
  scope :active, -> { where("expires_at > NOW()") }
end
