# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: activities
#
#  id            :uuid             not null, primary key
#  description   :text             not null
#  emoji         :string
#  location_name :string           not null
#  name          :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  template_id   :string
#  user_id       :uuid             not null
#
# Indexes
#
#  index_activities_on_user_id                  (user_id)
#  index_activities_on_user_id_and_template_id  (user_id,template_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Activity < ApplicationRecord
  # == Associations
  belongs_to :user
  has_many :coupons, class_name: "ActivityCoupon", dependent: :destroy

  sig { returns(User) }
  def user!
    user or raise ActiveRecord::RecordNotFound, "Missing associated user"
  end

  # == Normalizations
  removes_blank :emoji

  # == Validations
  validates :emoji, emoji: true, allow_nil: true
end
