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
#  join_request_id      :uuid
#  user_id              :uuid             not null
#
# Indexes
#
#  index_invitations_invitee_name_uniqueness  (invitee_name,user_id) UNIQUE
#  index_invitations_on_join_request_id       (join_request_id)
#  index_invitations_on_user_id               (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Invitation < ApplicationRecord
  # == Associations ==

  belongs_to :user
  has_many :user_friends, through: :user, source: :friends

  sig { returns(User) }
  def user!
    user or raise ActiveRecord::RecordNotFound, "Missing associated user"
  end

  belongs_to :join_request, class_name: "JoinRequest", optional: true
  has_one :friend, dependent: :nullify

  # == Validations ==

  validates :invitee_name,
            presence: true,
            uniqueness: { scope: :user, name: "already invited" }
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
    if user_friends.exists?(name: invitee_name)
      errors.add(:invitee_name, :uniqueness, message: "already registered")
    end
  end
end
