# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: announcements
#
#  id                          :uuid             not null, primary key
#  message                     :text             not null
#  test_recipient_phone_number :string
#  created_at                  :datetime         not null
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Announcement < ApplicationRecord
  include NormalizesPhoneNumber

  # == Normalizations
  normalizes_phone_number :test_recipient_phone_number

  # == Validations
  validates :message, presence: true
  validates :test_recipient_phone_number,
            phone: { possible: true, types: :mobile, extensions: false },
            allow_nil: true

  # == Callbacks
  before_create :send_now

  # == Methods
  sig { void }
  def send_now
    if (phone_number = test_recipient_phone_number)
      TwilioService.send_message(to: phone_number, body: message)
    else
      User.find_each do |user|
        TwilioService.send_message(to: user.phone_number, body: message)
      end
    end
  end
end
