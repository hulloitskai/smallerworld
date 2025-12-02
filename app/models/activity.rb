# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: activities
#
#  id                 :uuid             not null, primary key
#  description        :text             not null
#  emoji              :string
#  location_name      :string           not null
#  name               :string           not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  deprecated_user_id :uuid
#  template_id        :string
#  world_id           :uuid             not null
#
# Indexes
#
#  index_activities_on_deprecated_user_id  (deprecated_user_id)
#  index_activities_on_world_id            (world_id)
#  index_activities_uniqueness             (world_id,template_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (deprecated_user_id => users.id)
#  fk_rails_...  (world_id => worlds.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Activity < ApplicationRecord
  # == Associations ==

  belongs_to :world
  has_one :world_owner, through: :world, source: :owner

  has_many :coupons, class_name: "ActivityCoupon", dependent: :destroy

  sig { returns(World) }
  def world!
    world or raise ActiveRecord::RecordNotFound, "Missing associated world"
  end

  sig { returns(User) }
  def world_owner!
    world_owner or raise ActiveRecord::RecordNotFound, "Missing world owner"
  end

  # == Normalizations ==

  removes_blank :emoji

  # == Validations ==

  validates :emoji, emoji: true, allow_nil: true
end
