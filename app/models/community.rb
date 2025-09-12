# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: communities
#
#  id          :uuid             not null, primary key
#  description :text             not null
#  handle      :string           not null
#  name        :string           not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_communities_on_handle  (handle) UNIQUE
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Community < ApplicationRecord
  # == Attachments
  has_one_attached :icon
  has_one_attached :banner

  # == Associations
  has_many :links,
           class_name: "CommunityLink",
           dependent: :destroy,
           autosave: true
  has_many :memberships, class_name: "CommunityMembership", dependent: :destroy
  has_many :members, through: :memberships, source: :member
end
