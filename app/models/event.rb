# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: events
#
#  id               :uuid             not null, primary key
#  description      :text             not null
#  ends_at          :datetime
#  name             :string           not null
#  registration_url :string           not null
#  starts_at        :datetime         not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  community_id     :uuid
#  created_by_id    :uuid             not null
#
# Indexes
#
#  index_events_on_community_id   (community_id)
#  index_events_on_created_by_id  (created_by_id)
#
# Foreign Keys
#
#  fk_rails_...  (community_id => communities.id)
#  fk_rails_...  (created_by_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Event < ApplicationRecord
  # == Associations
  belongs_to :community
  belongs_to :created_by, class_name: "User"
  has_many :shares, class_name: "EventShare", dependent: :destroy

  # == Attachments
  has_one_attached :display_photo

  # == Validations
  validates :name, presence: true
  validates :starts_at, presence: true
  validates :ends_at, presence: true, comparison: { greater_than: :starts_at }
  validates :registration_url, presence: true
end
