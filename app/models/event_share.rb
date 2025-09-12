# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: event_shares
#
#  id         :uuid             not null, primary key
#  comment    :text             not null
#  emoji      :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  event_id   :uuid             not null
#  sharer_id  :uuid             not null
#
# Indexes
#
#  index_event_shares_on_event_id   (event_id)
#  index_event_shares_on_sharer_id  (sharer_id)
#
# Foreign Keys
#
#  fk_rails_...  (event_id => events.id)
#  fk_rails_...  (sharer_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class EventShare < ApplicationRecord
  # == Associations
  belongs_to :sharer, class_name: "User"
  belongs_to :event

  # == Validations
  validates :emoji, presence: true, emoji: true
  validates :comment, presence: true
end
