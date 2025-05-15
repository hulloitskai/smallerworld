# typed: true
# frozen_string_literal: true

require "rails"
require "sorbet-runtime"

class ErrorLogger
  extend T::Sig

  sig do
    params(
      error: Exception,
      handled: T::Boolean,
      severity: Symbol,
      context: T.untyped,
      source: T.untyped,
    ).void
  end
  def report(error, handled:, severity:, context:, source: nil)
    message = "#{error.class}:\n  #{error.message}"
    if (backtrace = error.backtrace)
      cleaned_backtrace = Rails.backtrace_cleaner.clean(backtrace)
      message += "\nCall stack:\n  " + cleaned_backtrace.join("\n  ")
    end
    Rails.logger.error(red(message))
  end

  private

  # == Helpers

  # Stolen from: https://github.com/charkost/prosopite/blob/cf46bbe8f050ac24e3e085cf1cb4a9cd707fce0f/lib/prosopite.rb#L267
  sig { params(str: String).returns(String) }
  def red(str)
    str.split("\n").map { |line| "\e[91m#{line}\e[0m" }.join("\n")
  end
end
