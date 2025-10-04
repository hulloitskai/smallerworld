# typed: strict
# frozen_string_literal: true

return unless defined?(Prosopite)

Rails.application.configure do
  config.after_initialize do
    Prosopite.rails_logger = true
    Prosopite.prosopite_logger = true
  end
end
