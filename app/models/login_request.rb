# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: login_requests
#
#  id           :uuid             not null, primary key
#  completed_at :datetime
#  login_code   :string           not null
#  phone_number :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_login_requests_on_completed_at  (completed_at)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class LoginRequest < ApplicationRecord
  include NormalizesPhoneNumber

  # == Constants ==

  EXPIRATION_DURATION = 5.minutes

  # == Attributes ==

  attribute :login_code, default: -> { generate_login_code }

  sig { returns(T::Boolean) }
  def completed? = completed_at?

  # == Tokens ==

  generates_token_for :registration

  # == Normalizations ==

  normalizes_phone_number :phone_number

  # == Validations ==

  validates :phone_number,
            presence: true,
            phone: { possible: true, types: :mobile, extensions: false }

  # == Callbacks ==

  before_create :deliver_login_code, if: :should_deliver_login_code?

  # == Scopes ==

  scope :incomplete, -> { where(completed_at: nil) }
  scope :valid, -> {
    incomplete.where("created_at > ?", EXPIRATION_DURATION.ago)
  }

  # == Methods ==

  sig { returns(T.nilable(String)) }
  def verified_phone_number
    phone_number if completed?
  end

  sig { returns(String) }
  def login_code_message
    "your smaller world login code is: #{login_code}"
  end

  sig { void }
  def mark_as_completed!
    update!(completed_at: Time.current) unless completed?
  end

  sig { void }
  def deliver_login_code
    TwilioService.send_message(to: phone_number, body: login_code_message)
  end

  sig { returns(T::Boolean) }
  def should_deliver_login_code?
    Rails.env.production?
  end

  sig { returns(String) }
  def generate_registration_token
    generate_token_for(:registration)
  end

  # == Helpers ==

  sig { returns(String) }
  def self.generate_login_code
    format("%06d", rand(0..999_999))
  end

  sig do
    params(phone_number: String, login_code: String)
      .returns(T.nilable(LoginRequest))
  end
  def self.find_valid(phone_number:, login_code:)
    phone_number = normalize_value_for(:phone_number, phone_number)
    login_code.strip!
    if login_code == special_occasion_verification_code
      valid.reverse_chronological.find_by(phone_number:)
    else
      valid.find_by(phone_number:, login_code:)
    end
  end

  sig { returns(T.nilable(String)) }
  private_class_method def self.special_occasion_verification_code
    Rails.application.credentials.authentication
      &.special_occasion_verification_code
  end

  sig { params(token: String).returns(LoginRequest) }
  def self.find_by_registration_token!(token)
    find_by_token_for!(:registration, token)
  end

  sig { params(token: String).returns(T.nilable(LoginRequest)) }
  def self.find_by_registration_token(token)
    find_by_token_for(:registration, token)
  end
end
