# typed: true
# frozen_string_literal: true

require "sorbet-runtime"

module Contact
  extend T::Sig

  # == Accessors
  sig { returns(String) }
  def self.email_address
    credentials.email_address!
  end

  sig { returns(String) }
  def self.phone_number
    credentials.phone_number!
  end

  # == Helpers
  sig { returns(T.untyped) }
  def self.credentials
    Rails.application.credentials.contact!
  end
end
