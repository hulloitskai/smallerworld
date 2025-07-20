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
    override.params(recipient: T.nilable(NotificationRecipient))
      .returns(NotificationMessage)
  end
  def notification_message(recipient:)
    unless recipient.nil? || recipient.is_a?(User)
      raise "Invalid recipient for #{self.class} notification: " \
        "#{recipient.inspect}"
    end
    friend = friend!
    NotificationMessage.new(
      title: "#{friend.name} wants to hear from u!",
      body: [emoji, message].join(" "),
      target_url: Rails.application.routes.url_helpers.world_url,
    )
  end

  sig do
    override
      .params(recipient: T.nilable(NotificationRecipient))
      .returns(T::Hash[String, T.untyped])
  end
  def legacy_notification_payload(recipient)
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
