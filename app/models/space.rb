# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: spaces
#
#  id          :uuid             not null, primary key
#  description :text             not null
#  name        :string           not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  owner_id    :uuid             not null
#
# Indexes
#
#  index_spaces_on_owner_id            (owner_id)
#  index_spaces_owner_name_uniqueness  (owner_id,name) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (owner_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Space < ApplicationRecord
  extend FriendlyId

  # == FriendlyId ==

  module FinderMethods
    include FriendlyId::FinderMethods

    private

    def parse_friendly_id(value)
      value.split("-").last
    end
  end

  friendly_id do |config|
    config.base = :id
    config.finder_methods = FinderMethods
  end

  def friendly_id
    if (name = self[:name]) && (id = self[:id])
      "#{name.parameterize}-#{id.delete("-")}"
    end
  end

  # == Associations ==

  belongs_to :owner, class_name: "User"
  has_one_attached :icon

  # == Validations ==
  validates :name, presence: true, uniqueness: { scope: :owner }
  validates :description, presence: true

  # sig { params(id: String).returns(Space) }
  # def self.friendly_find(id)
  # end

  # def friendly_id
  # end

  # sig { returns(String) }
  # def compact_id
  #   id.sub("-", "")
  # end
end
