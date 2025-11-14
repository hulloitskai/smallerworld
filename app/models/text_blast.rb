# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: text_blasts
#
#  id           :uuid             not null, primary key
#  phone_number :string           not null
#  sent_at      :datetime
#  created_at   :datetime         not null
#  friend_id    :uuid             not null
#  post_id      :uuid             not null
#
# Indexes
#
#  index_text_blasts_on_friend_id  (friend_id)
#  index_text_blasts_on_post_id    (post_id)
#
# Foreign Keys
#
#  fk_rails_...  (friend_id => friends.id)
#  fk_rails_...  (post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class TextBlast < ApplicationRecord
  include NormalizesPhoneNumber

  # == Attributes ==

  sig { returns(T.nilable(ActiveSupport::Duration)) }
  attr_accessor :send_delay

  sig { returns(T::Boolean) }
  def sent?
    sent_at?
  end

  # == Associations ==

  belongs_to :post
  belongs_to :friend

  sig { returns(Post) }
  def post!
    post or raise ActiveRecord::RecordNotFound, "Missing associated post"
  end

  sig { returns(Friend) }
  def friend!
    friend or raise ActiveRecord::RecordNotFound, "Missing associated friend"
  end

  # == Normalizations ==

  normalizes_phone_number :phone_number

  # == Validations ==

  validates :phone_number,
            presence: true,
            phone: { possible: true, types: :mobile, extensions: false }

  # == Callbacks ==

  before_validation :assign_phone_number_from_friend, if: :friend_changed?
  after_create :send_later, unless: :sent?

  # == Methods ==

  sig { void }
  def send_now
    TwilioService.send_message(
      to: phone_number,
      body: post!.text_message(friend!),
    )
    mark_as_sent!
  end

  sig { void }
  def send_later
    job = SendTextBlastJob
    if (wait = send_delay)
      job = job.set(wait:)
    end
    job.perform_later(self)
  end

  sig { void }
  def mark_as_sent!
    update!(sent_at: Time.current)
  end

  private

  # == Callback Handlers ==

  sig { void }
  def assign_phone_number_from_friend
    self[:phone_number] = friend!.phone_number
  end
end
