# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: users
#
#  id                            :uuid             not null, primary key
#  handle                        :string           not null
#  name                          :string           not null
#  notifications_last_cleared_at :datetime
#  phone_number                  :string           not null
#  theme                         :string
#  time_zone_name                :string           not null
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#
# Indexes
#
#  index_users_on_handle                         (handle) UNIQUE
#  index_users_on_notifications_last_cleared_at  (notifications_last_cleared_at)
#  index_users_on_phone_number                   (phone_number) UNIQUE
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class User < ApplicationRecord
  extend FriendlyId
  include NormalizesPhoneNumber
  include Notifiable

  # == FriendlyId
  friendly_id :handle, slug_column: :handle

  # == Attributes
  sig { returns(ActiveSupport::TimeZone) }
  def time_zone
    ActiveSupport::TimeZone.new(time_zone_name)
  end

  # == Associations
  has_many :sessions, dependent: :destroy
  has_many :friends, dependent: :destroy
  has_many :encouragements, through: :friends, dependent: :destroy
  has_many :posts,
           dependent: :destroy,
           inverse_of: :author,
           foreign_key: :author_id
  has_many :join_requests, dependent: :destroy

  # == Attachments
  has_one_attached :page_icon

  sig { returns(ActiveStorage::Blob) }
  def page_icon_blob!
    page_icon_blob or
      raise ActiveRecord::RecordNotFound, "Missing page icon blob"
  end

  # == Normalizations
  normalizes :name, with: ->(name) { name.strip }
  normalizes_phone_number :phone_number

  # == Validations
  validates :name,
            :handle,
            :phone_number,
            :page_icon,
            :time_zone_name,
            presence: true
  validates :name, length: { maximum: 30 }
  validates :handle, length: { minimum: 4 }
  validate :validate_time_zone_name

  # == Callbacks
  after_create :create_welcome_post!

  # == Methods
  sig { returns(T::Boolean) }
  def admin?
    Admin.phone_numbers.include?(phone_number)
  end

  sig { returns(Encouragement::PrivateAssociationRelation) }
  def encouragements_since_last_post
    transaction do
      encouragements = self.encouragements
      if (created_at = latest_post_created_at)
        encouragements = encouragements.where(
          "encouragements.created_at > ?",
          created_at,
        )
      end
      encouragements.chronological
    end
  end

  # sig { returns(Friend::PrivateRelation) }
  # def colocated_friends
  #   friend_push_registrations = PushRegistration
  #     .where(
  #       owner_type: "Friend",
  #       device_id: push_registrations.select(:device_id),
  #     )
  #   Friend
  #     .includes(:user)
  #     .where(id: friend_push_registrations.select(:owner_id))
  # end

  sig { returns(Post) }
  def create_welcome_post!
    posts.create!(
      type: "journal_entry",
      visibility: :public,
      emoji: "🌎",
      title: "welcome to my smaller world!",
      body_html: "<p>this is a space where i'll:</p><ul><li><p>keep you updated about what's actually going on in my life</p></li><li><p>post asks for help when i need it</p></li><li><p>let you know about events and adventures that you can join me on</p></li></ul>", # rubocop:disable Layout/LineLength
    )
  end

  # == Helpers
  sig { params(phone_number: String).returns(T.nilable(User)) }
  def self.find_by_phone_number(phone_number)
    phone_number = normalize_value_for(:phone_number, phone_number)
    find_by(phone_number:)
  end

  private

  # == Helpers
  sig { returns(T.nilable(ActiveSupport::TimeWithZone)) }
  def latest_post_created_at
    posts.reverse_chronological.pick(:created_at)
  end

  # == Validators
  sig { void }
  def validate_time_zone_name
    unless ActiveSupport::TimeZone.new(time_zone_name)
      errors.add(:time_zone_name, :invalid, message: "invalid time zone")
    end
  end
end
