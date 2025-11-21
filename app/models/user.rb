# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: users
#
#  id                              :uuid             not null, primary key
#  deprecated_allow_friend_sharing :boolean
#  deprecated_handle               :string
#  deprecated_hide_neko            :boolean
#  deprecated_hide_stats           :boolean
#  deprecated_reply_to_number      :string
#  deprecated_theme                :string
#  membership_tier                 :string
#  name                            :string           not null
#  notifications_last_cleared_at   :datetime
#  phone_number                    :string           not null
#  time_zone_name                  :string           not null
#  created_at                      :datetime         not null
#  updated_at                      :datetime         not null
#
# Indexes
#
#  index_users_on_deprecated_handle              (deprecated_handle) UNIQUE
#  index_users_on_membership_tier                (membership_tier)
#  index_users_on_notifications_last_cleared_at  (notifications_last_cleared_at)
#  index_users_on_phone_number                   (phone_number) UNIQUE
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class User < ApplicationRecord
  extend FriendlyId
  include NormalizesPhoneNumber
  include Notifiable
  include HasTimeZone
  include PgSearch::Model

  # == Constants ==

  ENCOURAGEMENTS_AVAILABLE_SINCE = Time.new(2025, 4, 11, 16, 0, 0, "-05:00")

  # == FriendlyId ==
  friendly_id :phone_number, slug_column: :phone_number

  # == Attributes ==

  enumerize :membership_tier, in: %i[supporter believer]

  sig { returns(Phonelib::Phone) }
  def phone
    Phonelib.parse(phone_number)
  end

  # == Associations ==

  has_one :world,
          inverse_of: :owner,
          foreign_key: :owner_id,
          dependent: :nullify
  accepts_nested_attributes_for :world, update_only: true

  has_many :sessions, dependent: :destroy
  has_many :posts,
           dependent: :destroy,
           inverse_of: :author,
           foreign_key: :author_id

  # == Normalizations ==

  strips_text :name
  normalizes_phone_number :phone_number, :reply_to_number

  # == Validations ==

  validates :name, presence: true, length: { maximum: 30 }
  validates :phone_number,
            presence: true,
            phone: { possible: true, types: :mobile, extensions: false }
  validates_time_zone_name

  # == Search ==

  pg_search_scope :search,
                  against: %i[name],
                  using: {
                    tsearch: {
                      websearch: true,
                    },
                  }

  # == Scopes ==

  scope :subscribed_to_public_posts, -> {
    joins(:world)
      .where(world: { handle: world_handles_subscribed_to_public_posts })
  }

  # == Methods ==

  sig { returns(T::Boolean) }
  def admin?
    Admin.phone_numbers.include?(phone_number)
  end

  sig { returns(ActiveSupport::TimeWithZone) }
  def last_active_at
    notifications_last_cleared_at || created_at
  end

  sig { returns(T::Set[Symbol]) }
  def feature_flags
    overrides&.feature_flags || Set.new
  end

  # One of: :supporter, :believer
  sig { returns(T.nilable(Enumerize::Value)) }
  def membership_tier
    overrides&.membership_tier || super
  end

  sig { returns(T::Set[Symbol]) }
  def supported_features
    features = feature_flags
    features << :debug if admin?
    features
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

  sig { returns(Friend::PrivateRelation) }
  def associated_friends
    Friend.where(phone_number:)
  end

  # == Helpers ==

  sig { params(phone_number: String).returns(T.nilable(User)) }
  def self.find_by_phone_number(phone_number)
    phone_number = normalize_value_for(:phone_number, phone_number)
    find_by(phone_number:)
  end

  sig { returns(T::Hash[String, UserOverrides]) }
  private_class_method def self.overrides_by_world_handle
    @overrides_by_world_handle ||= scoped do
      overrides = Rails.application.credentials.user_overrides.to_h
      overrides.transform_values! do |settings|
        flags_value = settings.feature_flags || []
        membership_tier = if (value = settings.membership_tier)
          self.membership_tier.find_value(value)
        end
        UserOverrides.new(
          feature_flags: flags_value.map(&:to_sym).to_set,
          membership_tier:,
        )
      end
      overrides.with_indifferent_access
    end
  end

  sig { params(world_handle: String).returns(T.nilable(UserOverrides)) }
  def self.overrides_for(world_handle)
    overrides_by_world_handle[world_handle]
  end

  sig { returns(T::Set[String]) }
  def self.world_handles_subscribed_to_public_posts
    @world_handles_subscribed_to_public_posts ||=
      overrides_by_world_handle
        .filter_map do |handle, user|
          if user.feature_flags.include?(:public_post_notifications)
            handle
          end
        end
        .to_set
  end

  private

  # == Helpers ==

  sig { returns(T.nilable(UserOverrides)) }
  def overrides
    if (handle = World.where(owner: self).pick(:handle))
      self.class.overrides_for(handle)
    end
  end
end
