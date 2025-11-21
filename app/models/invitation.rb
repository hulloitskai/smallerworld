# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: invitations
#
#  id                   :uuid             not null, primary key
#  invitee_emoji        :string
#  invitee_name         :string           not null
#  offered_activity_ids :uuid             default([]), not null, is an Array
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  deprecated_user_id   :uuid
#  join_request_id      :uuid
#  world_id             :uuid             not null
#
# Indexes
#
#  index_invitations_invitee_name_uniqueness  (world_id,invitee_name) UNIQUE
#  index_invitations_on_deprecated_user_id    (deprecated_user_id)
#  index_invitations_on_join_request_id       (join_request_id)
#  index_invitations_on_world_id              (world_id)
#
# Foreign Keys
#
#  fk_rails_...  (deprecated_user_id => users.id)
#  fk_rails_...  (world_id => worlds.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Invitation < ApplicationRecord
  # == Associations ==

  belongs_to :world
  has_one :world_owner, through: :world, source: :owner
  has_many :world_friends, through: :world, source: :friends

  sig { returns(World) }
  def world!
    world or raise ActiveRecord::RecordNotFound, "Missing associated world"
  end

  sig { returns(User) }
  def world_owner!
    world_owner or raise ActiveRecord::RecordNotFound, "Missing world owner"
  end

  belongs_to :join_request, class_name: "JoinRequest", optional: true
  has_one :friend, dependent: :nullify

  # == Validations ==

  validates :invitee_name,
            presence: true,
            uniqueness: { scope: :world, message: "already invited" }
  validates :invitee_emoji, emoji: true, allow_nil: true
  validate :validate_not_existing_friend_name, unless: :existing_friend?

  # == Scopes ==

  scope :pending, -> { where.missing(:friend) }

  private

  # == Helpers ==

  sig { returns(T::Boolean) }
  def existing_friend?
    !!friend
  end

  # == Validators ==

  sig { void }
  def validate_not_existing_friend_name
    if world_friends.exists?(name: invitee_name)
      errors.add(:invitee_name, :uniqueness, message: "already registered")
    end
  end
end
