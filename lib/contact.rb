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

  sig { returns(Addressable::URI) }
  def self.mailto_uri
    Addressable::URI.parse("mailto:" + email_address)
  end

  sig { returns(Addressable::URI) }
  def self.plain_mailto_uri
    addr = Mail::Address.new(email_address)
    Addressable::URI.parse("mailto:" + addr.address)
  end

  sig { returns(String) }
  def self.phone_number
    credentials.phone_number!
  end

  sig { returns(Addressable::URI) }
  def self.sms_uri
    Addressable::URI.parse("sms:" + phone_number)
  end

  # == Helpers
  sig { returns(T.untyped) }
  def self.credentials
    Rails.application.credentials.contact!
  end
end
