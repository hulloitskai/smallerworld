# typed: true
# frozen_string_literal: true

class PhoneVerificationRequestSerializer < ApplicationSerializer
  # == Attributes
  attributes :verification_code, verification_code_message: { type: :string }
end
