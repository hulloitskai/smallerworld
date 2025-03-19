# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: join_requests
#
#  id           :uuid             not null, primary key
#  name         :string           not null
#  phone_number :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  user_id      :uuid             not null
#
# Indexes
#
#  index_join_requests_on_user_id  (user_id)
#  index_join_requests_uniqueness  (user_id,phone_number) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class JoinRequest < ApplicationRecord
  # == Associations
  belongs_to :user
  has_one :friend, dependent: :nullify

  # == Validations
  validates :name, :phone_number, presence: true
  validates :phone_number, uniqueness: { scope: :user }

  # == Scopes
  scope :pending, -> { where.missing(:friend) }
  scope :accepted, -> { where.associated(:friend) }
end
