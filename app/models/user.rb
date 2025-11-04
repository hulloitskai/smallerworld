# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: users
#
#  id                            :uuid             not null, primary key
#  allow_friend_sharing          :boolean          not null
#  api_token                     :string
#  handle                        :string           not null
#  hide_neko                     :boolean          not null
#  hide_stats                    :boolean          not null
#  name                          :string           not null
#  notifications_last_cleared_at :datetime
#  phone_number                  :string           not null
#  reply_to_number               :string
#  theme                         :string
#  time_zone_name                :string           not null
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#
# Indexes
#
#  index_users_on_api_token                      (api_token) UNIQUE
#  index_users_on_handle                         (handle) UNIQUE
#  index_users_on_notifications_last_cleared_at  (notifications_last_cleared_at)
#  index_users_on_phone_number                   (phone_number) UNIQUE
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class User < ApplicationRecord
  extend FriendlyId
  include NormalizesPhoneNumber
  include Notifiable
  include ImageHelpers
  include PgSearch::Model

  # == Constants
  ENCOURAGEMENTS_AVAILABLE_SINCE = Time.new(2025, 4, 11, 16, 0, 0, "-05:00")
  MIN_POST_COUNT_FOR_SEARCH = T.let(Rails.env.production? ? 10 : 2, Integer)
  DARK_THEMES = T.let(
    %w[
      darkSky
      forest
      karaoke
      lavaRave
      aquatica
      rush
      phantom
      bakudeku
    ].freeze,
    T::Array[String],
  )

  # == FriendlyId
  friendly_id :handle, slug_column: :handle

  # == Attributes
  sig { returns(Phonelib::Phone) }
  def phone
    Phonelib.parse(phone_number)
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
  has_many :invitations, dependent: :destroy
  has_many :activities, dependent: :destroy
  has_many :activity_coupons, through: :activities, source: :coupons

  # == Attachments
  has_one_attached :page_icon

  sig { returns(T::Boolean) }
  def page_icon? = page_icon.attached?

  sig { returns(T::Boolean) }
  def page_icon_changed?
    attachment_changes.include?("page_icon")
  end

  sig { returns(ActiveStorage::Blob) }
  def page_icon_blob!
    page_icon_attachment&.blob or
      raise ActiveRecord::RecordNotFound, "Missing page icon"
  end

  sig { returns(Image) }
  def page_icon_image
    page_icon_blob!.becomes(Image)
  end

  # == Normalizations
  strips_text :name
  normalizes_phone_number :phone_number, :reply_to_number

  # == Validations
  validates :name,
            :handle,
            :page_icon,
            :time_zone_name,
            presence: true
  validates :phone_number,
            presence: true,
            phone: { possible: true, types: :mobile, extensions: false }
  validates :reply_to_number,
            phone: { possible: true, types: :mobile, extensions: false },
            allow_nil: true
  validates :name, length: { maximum: 30 }
  validates :handle,
            length: { minimum: 2 },
            exclusion: { in: %i[kai], message: "is reserved" }
  validate :validate_time_zone_name
  validate :validate_opaque_page_icon, if: %i[page_icon? page_icon_changed?]

  # == Callbacks
  after_create :create_welcome_post!

  # == Search
  pg_search_scope :search,
                  against: %i[name],
                  using: {
                    tsearch: {
                      websearch: true,
                    },
                  }

  # == Scopes
  scope :subscribed_to_public_posts, -> {
    where(handle: handles_subscribed_to_public_posts)
  }

  # == Time zone
  sig { returns(ActiveSupport::TimeZone) }
  def time_zone
    ActiveSupport::TimeZone.new(time_zone_name)
  end

  sig do
    params(value: T.any(String, ActiveSupport::TimeZone)).returns(T.untyped)
  end
  def time_zone=(value)
    self.time_zone_name = case value
    when String
      value
    when ActiveSupport::TimeZone
      value.tzinfo.name
    end
  end

  # == Methods
  sig { returns(T::Boolean) }
  def admin?
    Admin.phone_numbers.include?(phone_number)
  end

  sig { returns(String) }
  def generate_api_token!
    api_token = self.class.generate_unique_secure_token
    update!(api_token:)
    api_token
  end

  sig { returns(ActiveSupport::TimeWithZone) }
  def last_active_at
    notifications_last_cleared_at || created_at
  end

  sig { returns(T::Set[Symbol]) }
  def feature_flags
    self.class.feature_flags_for(handle)
  end

  sig { returns(T::Set[Symbol]) }
  def supported_features
    features = feature_flags
    if push_registrations.any? &&
        last_active_at >= ENCOURAGEMENTS_AVAILABLE_SINCE
      features << :encouragements
    end
    if posts.count >= MIN_POST_COUNT_FOR_SEARCH
      features << :search
    end
    features
  end

  sig { returns(T::Boolean) }
  def dark_theme?
    theme.present? && DARK_THEMES.include?(theme)
  end

  sig { returns(Encouragement::PrivateAssociationRelation) }
  def encouragements_since_last_poem_or_journal_entry
    transaction do
      encouragements = self.encouragements
      if (created_at = latest_poem_or_journal_created_at)
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
      created_at:,
      type: "journal_entry",
      visibility: :public,
      emoji: "🌎",
      title: "welcome to my smaller world!",
      body_html: "<p>this is a space where i'll:</p><ul><li><p>keep you updated about what's actually going on in my life</p></li><li><p>post asks for help when i need it</p></li><li><p>let you know about events and adventures that you can join me on</p></li></ul>", # rubocop:disable Layout/LineLength
    )
  end

  sig { params(params: T.untyped).returns(String) }
  def shortlink_url(**params)
    ShortlinkService.url_helpers.user_url(self, **params)
  end

  sig { returns(Friend::PrivateRelation) }
  def associated_friends
    Friend.where(phone_number:)
  end

  sig { returns(T::Array[Symbol]) }
  def disabled_messaging_platforms
    disabled_platforms = T.let([], T::Array[Symbol])
    if GreenApiService.enabled? &&
        !GreenApiService.reachable_on_whatsapp?(phone_number) == false
      disabled_platforms << :whatsapp
    end
    disabled_platforms
  end

  sig do
    params(time_zone: ActiveSupport::TimeZone).returns([Integer, T::Boolean])
  end
  def post_streak(time_zone: self.time_zone)
    sql = <<~SQL.squish
      WITH daily_posts AS (
        SELECT DISTINCT DATE(posts.created_at AT TIME ZONE INTERVAL :offset) AS user_date
        FROM posts
        WHERE posts.author_id = :user_id
      ),
      numbered_posts AS (
        SELECT
          user_date,
          ROW_NUMBER() OVER (ORDER BY user_date)::int AS rn
        FROM daily_posts
      ),
      grouped_posts AS (
        SELECT
          MAX(user_date) AS end_date,
          COUNT(*) AS streak_length
        FROM numbered_posts
        GROUP BY user_date - rn
      )
      SELECT
        streak_length,
        end_date
      FROM grouped_posts
      ORDER BY end_date DESC
      LIMIT 1
    SQL
    interpolated_sql = Post.sanitize_sql_array([sql, {
      user_id: id,
      offset: time_zone.formatted_offset,
    },])

    result = Post.connection.exec_query(interpolated_sql)
    return [0, false] if result.rows.empty?

    row = result.first
    streak = T.cast(row["streak_length"], Integer)
    end_date = T.cast(row["end_date"], Date)
    return [0, false] if end_date < (time_zone.today - 1)

    posted_today = end_date == time_zone.today
    [streak, posted_today]
  end

  # == Helpers
  sig { params(phone_number: String).returns(T.nilable(User)) }
  def self.find_by_phone_number(phone_number)
    phone_number = normalize_value_for(:phone_number, phone_number)
    find_by(phone_number:)
  end

  sig { params(handle: String).returns(T::Set[Symbol]) }
  def self.feature_flags_for(handle)
    @feature_flags ||= Hash.new do |hash, key|
      hash[key] = if (flags = Rails.application.credentials
        .dig(:feature_flags, key))
        flags.map(&:to_sym).to_set
      else
        Set.new
      end
    end
    @feature_flags[handle]
  end

  sig { returns(T::Set[String]) }
  def self.handles_subscribed_to_public_posts
    @handles_subscribed_to_public_posts ||= scoped do
      all_flags = Rails.application.credentials.feature_flags or next Set.new
      handles = all_flags.filter_map do |handle, flags|
        if flags.include?("public_post_notifications")
          handle
        end
      end
      handles.to_set
    end
  end

  private

  # == Helpers
  sig { returns(T.nilable(ActiveSupport::TimeWithZone)) }
  def latest_poem_or_journal_created_at
    posts
      .where(type: %i[poem journal_entry])
      .reverse_chronological
      .pick(:created_at)
  end

  # == Validators
  sig { void }
  def validate_time_zone_name
    unless ActiveSupport::TimeZone.new(time_zone_name)
      errors.add(:time_zone_name, :invalid, message: "invalid time zone")
    end
  end

  sig { void }
  def validate_opaque_page_icon
    if (blob = page_icon.public_send(:blob)) && !image_blob_is_opaque?(blob)
      errors.add(:page_icon, :invalid, message: "must be opaque")
    end
  end
end
