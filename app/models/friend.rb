# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: friends
#
#  id                            :uuid             not null, primary key
#  access_token                  :string           not null
#  chosen_family                 :boolean          not null
#  emoji                         :string
#  name                          :string           not null
#  notifications_last_cleared_at :datetime
#  paused_since                  :datetime
#  phone_number                  :string
#  subscribed_post_types         :string           not null, is an Array
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#  join_request_id               :uuid
#  user_id                       :uuid             not null
#
# Indexes
#
#  index_friends_on_access_token                   (access_token) UNIQUE
#  index_friends_on_chosen_family                  (chosen_family)
#  index_friends_on_join_request_id                (join_request_id)
#  index_friends_on_notifications_last_cleared_at  (notifications_last_cleared_at)
#  index_friends_on_phone_number                   (phone_number)
#  index_friends_on_user_id                        (user_id)
#  index_friends_uniqueness                        (name,user_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (join_request_id => join_requests.id)
#  fk_rails_...  (user_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Friend < ApplicationRecord
  include NormalizesPhoneNumber
  include Notifiable
  include Noticeable

  # == Attributes
  enumerize :subscribed_post_types,
            in: Post.type.values,
            multiple: true,
            default: Post.type.values
  attribute :chosen_family, default: false
  has_secure_token :access_token

  sig { returns(T::Boolean) }
  def paused? = paused_since?

  # == Associations
  belongs_to :user
  belongs_to :join_request, optional: true
  has_many :post_reactions, dependent: :destroy
  has_many :post_reply_receipts, dependent: :destroy

  sig { returns(User) }
  def user!
    user or raise ActiveRecord::RecordNotFound, "Missing user"
  end

  # == Normalizations
  normalizes :name, with: ->(name) { name.strip }
  normalizes_phone_number :phone_number

  # == Validations
  validates :name, presence: true, uniqueness: { scope: :user }
  validates :emoji, emoji: true, allow_nil: true

  # == Scopes
  scope :active, -> { where(paused_since: nil) }
  scope :paused, -> { where.not(paused_since: nil) }
  scope :subscribed_to, ->(post_type) {
    where("? = ANY (subscribed_post_types)", post_type)
  }
  scope :chosen_family, -> { where(chosen_family: true) }

  # == Noticeable
  sig do
    override
      .params(recipient: T.all(ActiveRecord::Base, Notifiable))
      .returns(T::Hash[String, T.untyped])
  end
  def notification_payload(recipient)
    payload = FriendNotificationPayload.new(friend: self)
    FriendNotificationPayloadSerializer.one(payload)
  end

  # == Methods
  sig { void }
  def create_notification!
    notifications.create!(recipient: user!)
  end
end
