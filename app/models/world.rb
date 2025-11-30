# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: worlds
#
#  id                       :uuid             not null, primary key
#  allow_friend_sharing     :boolean          default(TRUE), not null
#  handle                   :string           not null
#  hide_neko                :boolean          default(FALSE), not null
#  hide_stats               :boolean          default(FALSE), not null
#  reply_to_number_override :string
#  theme                    :string
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  owner_id                 :uuid             not null
#
# Indexes
#
#  index_worlds_on_handle    (handle) UNIQUE
#  index_worlds_on_owner_id  (owner_id)
#
# Foreign Keys
#
#  fk_rails_...  (owner_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class World < ApplicationRecord
  extend FriendlyId
  include NormalizesPhoneNumber
  include ImageHelpers

  # == Constants ==

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

  # == FriendlyId ==

  friendly_id :handle, use: :slugged, slug_column: :handle

  # == Associations ==

  belongs_to :owner, class_name: "User"
  accepts_nested_attributes_for :owner, update_only: true

  has_many :posts, dependent: :destroy
  has_many :join_requests, dependent: :destroy
  has_many :invitations, dependent: :destroy

  has_many :friends, dependent: :destroy
  has_many :encouragements, through: :friends, dependent: :destroy

  has_many :activities, dependent: :destroy
  has_many :activity_coupons, through: :activities, source: :coupons

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

  sig { returns(ActiveStorage::Blob) }
  def icon_blob!
    icon_attachment&.blob or
      raise ActiveRecord::RecordNotFound, "Missing icon"
  end

  sig { returns(Image) }
  def icon_image
    icon_blob!.becomes(Image)
  end

  # == Normalizations ==

  normalizes_phone_number :reply_to_number_override

  # == Validations ==

  validates :handle,
            presence: true,
            length: { minimum: 2 },
            exclusion: { in: %i[kai], message: "is reserved" }
  validates :icon, presence: true
  validates :reply_to_number_override,
            phone: { possible: true, types: :mobile, extensions: false },
            allow_nil: true
  validate :validate_opaque_icon, if: %i[icon? icon_changed?]

  # == Callbacks ==

  after_create :create_welcome_post!

  # == Scopes ==

  scope :with_owner, -> { includes(:owner) }

  # == Methods ==

  sig { returns(String) }
  def name
    owner = owner!
    "#{owner.name}'s world"
  end

  sig { returns(String) }
  def reply_to_number
    reply_to_number_override || owner!.phone_number
  end

  sig { returns(Phonelib::Phone) }
  def reply_to_phone
    Phonelib.parse(reply_to_number)
  end

  sig { returns(T::Boolean) }
  def search_enabled?
    posts.count >= MIN_POST_COUNT_FOR_SEARCH
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

  sig { returns(Post) }
  def create_welcome_post!
    posts.create!(
      created_at:,
      author: owner!,
      type: "journal_entry",
      visibility: :public,
      emoji: "🌎",
      title: "welcome to my smaller world!",
      body_html: "<p>this is a space where i'll:</p><ul><li><p>keep you updated about what's actually going on in my life</p></li><li><p>post asks for help when i need it</p></li><li><p>let you know about events and adventures that you can join me on</p></li></ul>", # rubocop:disable Layout/LineLength
    )
  end

  sig do
    params(time_zone: ActiveSupport::TimeZone).returns(T.nilable(PostStreak))
  end
  def post_streak(time_zone: owner!.time_zone)
    sql = <<~SQL.squish
      WITH daily_posts AS (
        SELECT DISTINCT DATE(posts.created_at AT TIME ZONE :tz) AS local_date
        FROM posts
        WHERE posts.world_id = :world_id
      ),
      numbered_posts AS (
        SELECT
          local_date,
          ROW_NUMBER() OVER (ORDER BY local_date)::int AS rn
        FROM daily_posts
      ),
      grouped_posts AS (
        SELECT
          MAX(local_date) AS end_date,
          COUNT(*) AS streak_length
        FROM numbered_posts
        GROUP BY local_date - rn
      )
      SELECT
        streak_length,
        end_date
      FROM grouped_posts
      ORDER BY end_date DESC
      LIMIT 1
    SQL
    interpolated_sql = Post.sanitize_sql_array([
      sql,
      { world_id: id, tz: time_zone.name },
    ])

    result = Post.connection.exec_query(interpolated_sql)
    return if result.rows.empty?

    row = result.first
    length = T.cast(row["streak_length"], Integer)
    end_date = T.cast(row["end_date"], Date)
    return if end_date < (time_zone.today - 1)

    posted_today = end_date == time_zone.today
    PostStreak.new(length:, posted_today:)
  end

  sig { params(params: T.untyped).returns(String) }
  def shortlink_url(**params)
    ShortlinkService.url_helpers.world_url(self, **params)
  end

  private

  # == Helpers ==

  sig { returns(T.nilable(ActiveSupport::TimeWithZone)) }
  def latest_poem_or_journal_created_at
    posts
      .where(type: %i[poem journal_entry])
      .reverse_chronological
      .pick(:created_at)
  end

  # == Validators ==

  sig { void }
  def validate_opaque_icon
    if (blob = icon.public_send(:blob)) && !image_blob_is_opaque?(blob)
      errors.add(:icon, :invalid, message: "must be opaque")
    end
  end
end
