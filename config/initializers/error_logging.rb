# typed: true
# frozen_string_literal: true

require "error_logger"

Rails.application.configure do
  config.after_initialize do
    Rails.error.subscribe(ErrorLogger.new)
  end
end
