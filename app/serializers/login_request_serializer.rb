# typed: true
# frozen_string_literal: true

class LoginRequestSerializer < ApplicationSerializer
  # == Attributes
  attributes :login_code, login_code_message: { type: :string }
end
