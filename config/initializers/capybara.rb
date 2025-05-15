# typed: strict
# frozen_string_literal: true

return unless defined?(Capybara)

Capybara.register_driver(:playwright) do |app|
  Capybara::Playwright::Driver.new(app, headless: ENV["CI"].present?)
end
