# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: community_links
#
#  id           :uuid             not null, primary key
#  label        :string
#  type         :string           not null
#  url          :string           not null
#  community_id :uuid             not null
#
# Indexes
#
#  index_community_links_on_community_id  (community_id)
#
# Foreign Keys
#
#  fk_rails_...  (community_id => communities.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class CommunityLink < ApplicationRecord
  # == Configuration
  self.inheritance_column = nil

  # == Attributes
  enumerize :type, in: %i[whatsapp_group instagram website calendar]

  # == Associations
  belongs_to :community, touch: true

  # == Validations
  validates :url, url: {
    schemes: ["https"],
    public_suffix: true,
    no_local: true,
  }
end
