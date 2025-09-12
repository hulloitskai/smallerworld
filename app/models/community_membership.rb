# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: community_memberships
#
#  id           :uuid             not null, primary key
#  role         :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  community_id :uuid             not null
#  member_id    :uuid             not null
#
# Indexes
#
#  index_community_memberships_on_community_id  (community_id)
#  index_community_memberships_on_member_id     (member_id)
#
# Foreign Keys
#
#  fk_rails_...  (community_id => communities.id)
#  fk_rails_...  (member_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class CommunityMembership < ApplicationRecord
  # == Attributes
  enumerize :role, in: %i[member admin]

  # == Associations
  belongs_to :member, class_name: "User"
  belongs_to :community
end
