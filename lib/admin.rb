# typed: true
# frozen_string_literal: true

require "sorbet-runtime"
require "rails"
require "phonelib"

module Admin
  extend T::Sig

  # == Accessors
  sig { returns(T::Array[String]) }
  def self.phone_numbers
    @phone_numbers ||= scoped do
      numbers = credentials.phone_numbers || []
      numbers.map { |number| Phonelib.parse(number).to_s }
    end
  end

  # == Helpers
  sig { returns(T.untyped) }
  def self.credentials
    Rails.application.credentials.admin!
  end
end
