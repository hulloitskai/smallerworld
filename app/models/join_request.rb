# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: join_requests
#
#  id                 :uuid             not null, primary key
#  name               :string           not null
#  phone_number       :string           not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  deprecated_user_id :uuid
#  world_id           :uuid             not null
#
# Indexes
#
#  index_join_requests_on_deprecated_user_id  (deprecated_user_id)
#  index_join_requests_on_world_id            (world_id)
#  index_join_requests_uniqueness             (world_id,phone_number) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (deprecated_user_id => users.id)
#  fk_rails_...  (world_id => worlds.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class JoinRequest < ApplicationRecord
  include NormalizesPhoneNumber
  include Noticeable

  # == Associations ==

  belongs_to :world
  has_one :world_owner, through: :world, source: :owner

  has_one :invitation, dependent: :nullify
  has_one :friend, through: :invitation
  has_one :deprecated_friend,
          class_name: "Friend",
          inverse_of: false,
          foreign_key: :deprecated_join_request_id,
          dependent: :nullify

  sig { returns(World) }
  def world!
    world or raise ActiveRecord::RecordNotFound, "Missing associated world"
  end

  sig { returns(User) }
  def world_owner!
    world_owner or raise ActiveRecord::RecordNotFound, "Missing world owner"
  end

  # == Normalizations ==

  strips_text :name
  normalizes_phone_number :phone_number

  # == Validations ==

  validates :name, :phone_number, presence: true
  validates :phone_number, uniqueness: { scope: :world }

  # == Scopes ==

  scope :pending, -> {
    where.missing(:invitation)
      .where.not(id: where.associated(:deprecated_friend))
  }

  # == Callbacks ==

  after_create :create_notification!

  # == Noticeable ==

  sig { override.params(recipient: Notifiable).returns(NotificationMessage) }
  def notification_message(recipient:)
    case recipient
    when User
      NotificationMessage.new(
        title: "#{name} wants to join your world!",
        body: "request from #{name} (#{phone_number})",
        target_url: Rails.application.routes.url_helpers
          .user_world_join_requests_path(
            world: world!,
            join_request_id: id,
          ),
      )
    else
      raise "Invalid notification recipient: #{recipient.inspect}"
    end
  end

  # == Methods ==

  sig { void }
  def create_notification!
    notifications.create!(recipient: world_owner!)
  end
end
