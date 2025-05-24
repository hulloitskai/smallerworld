# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: encouragements
#
#  id         :uuid             not null, primary key
#  emoji      :string           not null
#  message    :text             not null
#  created_at :datetime         not null
#  friend_id  :uuid             not null
#
# Indexes
#
#  index_encouragements_on_created_at  (created_at)
#  index_encouragements_on_friend_id   (friend_id)
#
# Foreign Keys
#
#  fk_rails_...  (friend_id => friends.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Encouragement < ApplicationRecord
  include Noticeable

  # == Constants
  AVAILABLE_SINCE = Time.new(2025, 4, 11, 16, 0, 0, "-05:00")

  # == Associations
  belongs_to :friend
  has_one :user, through: :friend

  sig { returns(Friend) }
  def friend!
    friend or raise ActiveRecord::RecordNotFound, "Missing associated friend"
  end

  sig { returns(User) }
  def user!
    user or raise ActiveRecord::RecordNotFound, "Missing associated user"
  end

  # == Validations
  validates :emoji, emoji: true
  validates :message, presence: true, length: { maximum: 240 }
  validate :validate_no_other_encouragement_in_last_12_hours

  # == Callbacks
  after_create :create_notification!

  # == Noticeable
  sig do
    override
      .params(recipient: T.nilable(T.all(ApplicationRecord, Notifiable)))
      .returns(T::Hash[String, T.untyped])
  end
  def notification_payload(recipient)
    payload = EncouragementNotificationPayload.new(encouragement: self)
    EncouragementNotificationPayloadSerializer.one(payload)
  end

  # == Methods
  sig { void }
  def create_notification!
    notifications.create!(recipient: user!)
  end

  private

  # == Validators
  sig { void }
  def validate_no_other_encouragement_in_last_12_hours
    other_encouragements = friend!
      .encouragements
      .where("created_at > ?", 12.hours.ago)
    if (id = self[:id])
      other_encouragements = other_encouragements.where.not(id:)
    end
    if other_encouragements.exists?
      errors.add(
        :base,
        :invalid,
        message: "already created for this friend in the last 12 hours",
      )
    end
  end
end
