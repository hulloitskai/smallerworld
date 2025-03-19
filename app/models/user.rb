# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: users
#
#  id           :uuid             not null, primary key
#  handle       :string           not null
#  name         :string           not null
#  phone_number :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_users_on_handle        (handle) UNIQUE
#  index_users_on_phone_number  (phone_number) UNIQUE
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class User < ApplicationRecord
  include Notifiable

  # == FriendlyId
  extend FriendlyId

  friendly_id :handle, slug_column: :handle

  # == Associations
  has_many :friends, dependent: :destroy
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
  normalizes :phone_number, with: ->(number) {
    phone = Phonelib.parse(number)
    phone.to_s
  }

  # == Validations
  validates :name, :handle, :phone_number, :page_icon, presence: true
  validates :name, length: { maximum: 30 }
  validates :handle, length: { minimum: 4 }

  # == Callbacks
  after_create :create_welcome_post!

  # == Methods
  sig { returns(T::Boolean) }
  def admin?
    Admin.phone_numbers.include?(phone_number)
  end

  sig { returns(Post) }
  def create_welcome_post!
    posts.create!(
      type: "journal_entry",
      emoji: "🌎",
      title: "welcome to my smaller world!",
      body_html: "<p>this is a space where i'll:</p><ul><li><p>keep you updated about what's actually going on in my life</p></li><li><p>post asks for help when i need it</p></li><li><p>let you know about events and adventures that you can join me on</p></li></ul>", # rubocop:disable Layout/LineLength
    )
  end
end
