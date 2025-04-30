# typed: strict
# frozen_string_literal: true

return unless defined?(Prosopite)

require "prosopite/middleware/rack"

Rails.application.configure do
  config.after_initialize do
    Prosopite.rails_logger = true
  end
end

Rails.configuration.middleware.use(Prosopite::Middleware::Rack)
