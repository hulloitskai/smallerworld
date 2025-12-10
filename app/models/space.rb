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
#  public      :boolean          default(FALSE), not null
#  theme       :string
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
  include ImageHelpers

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
      "#{name[..32].strip.parameterize}-#{id.delete("-")}"
    end
  end

  # == Associations ==

  belongs_to :owner, class_name: "User", inverse_of: :owned_spaces
  has_many :posts, dependent: :destroy

  sig { returns(User) }
  def owner!
    owner or raise ActiveRecord::RecordNotFound, "Missing owner"
  end

  # == Attachments ==

  has_one_attached :icon

  sig { returns(T::Boolean) }
  def icon? = icon.attached?

  sig { returns(T::Boolean) }
  def icon_changed?
    attachment_changes.include?("icon")
  end

  sig { returns(T.nilable(ActiveStorage::Blob)) }
  def icon_blob
    icon_attachment&.blob
  end

  sig { returns(T.nilable(Image)) }
  def icon_image
    if (blob = icon_blob)
      blob.becomes(Image)
    end
  end

  sig { returns(User::PrivateRelation) }
  def members
    User
      .where(id: owner_id)
      .or(User.where(id: posts.distinct.select(:author_id)))
  end

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
