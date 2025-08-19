# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: phone_verification_requests
#
#  id                :uuid             not null, primary key
#  phone_number      :string           not null
#  verification_code :string           not null
#  verified_at       :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_phone_verification_requests_on_verified_at  (verified_at)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class PhoneVerificationRequest < ApplicationRecord
  # == Constants
  EXPIRATION_DURATION = 5.minutes

  # == Attributes
  attribute :verification_code, default: -> { generate_verification_code }

  sig { returns(T::Boolean) }
  def verified? = verified_at?

  # == Tokens
  generates_token_for :registration

  # == Validations
  validates :phone_number,
            phone: { possible: true, types: :mobile, extensions: false }

  # == Normalizations
  normalizes :phone_number, with: ->(number) {
    phone = Phonelib.parse(number)
    phone.to_s
  }

  # == Callbacks
  before_create :deliver_verification_code,
                if: :should_deliver_verification_code?

  # == Scopes
  scope :unverified, -> { where(verified_at: nil) }
  scope :valid, -> {
    unverified.where("created_at > ?", EXPIRATION_DURATION.ago)
  }

  # == Methods
  sig { returns(T.nilable(String)) }
  def verified_phone_number
    phone_number if verified?
  end

  sig { returns(String) }
  def verification_code_message
    "your smaller world code is: #{verification_code}"
  end

  sig { void }
  def mark_as_verified!
    update!(verified_at: Time.current) unless verified?
  end

  sig { void }
  def deliver_verification_code
    TwilioService.instance.send_message(
      to: phone_number,
      body: verification_code_message,
    )
  end

  sig { returns(T::Boolean) }
  def should_deliver_verification_code?
    Rails.env.production?
  end

  sig { returns(String) }
  def generate_registration_token
    generate_token_for(:registration)
  end

  # == Helpers
  sig { returns(String) }
  def self.generate_verification_code
    format("%06d", rand(0..999_999))
  end

  sig do
    params(phone_number: String, verification_code: String)
      .returns(T.nilable(PhoneVerificationRequest))
  end
  def self.find_valid(phone_number:, verification_code:)
    phone_number = normalize_value_for(:phone_number, phone_number)
    verification_code.strip!
    if verification_code == special_occasion_verification_code
      valid.reverse_chronological.find_by(phone_number:)
    else
      valid.find_by(phone_number:, verification_code:)
    end
  end

  sig { returns(T.nilable(String)) }
  private_class_method def self.special_occasion_verification_code
    Rails.application.credentials.authentication
      &.special_occasion_verification_code
  end

  sig { params(token: String).returns(PhoneVerificationRequest) }
  def self.find_by_registration_token!(token)
    find_by_token_for!(:registration, token)
  end

  sig { params(token: String).returns(T.nilable(PhoneVerificationRequest)) }
  def self.find_by_registration_token(token)
    find_by_token_for(:registration, token)
  end
end
