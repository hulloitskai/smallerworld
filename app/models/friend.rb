# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: friends
#
#  id           :uuid             not null, primary key
#  access_token :string           not null
#  emoji        :string
#  name         :string           not null
#  paused_since :datetime
#  phone_number :string
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  user_id      :uuid             not null
#
# Indexes
#
#  index_friends_on_access_token  (access_token) UNIQUE
#  index_friends_on_phone_number  (phone_number)
#  index_friends_on_user_id       (user_id)
#  index_friends_uniqueness       (name,user_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Friend < ApplicationRecord
  include Notifiable

  # == Attributes
  has_secure_token :access_token

  sig { returns(T::Boolean) }
  def paused? = paused_since?

  # == Associations
  belongs_to :user

  sig { returns(User) }
  def user!
    user or raise ActiveRecord::RecordNotFound, "Missing user"
  end

  # == Validations
  validates :name, presence: true, uniqueness: { scope: :user }
  validates :emoji, emoji: true, allow_nil: true

  # == Scopes
  scope :active, -> { where(paused_since: nil) }
  scope :paused, -> { where.not(paused_since: nil) }
end
