# typed: strict
# frozen_string_literal: true

if defined?(Capybara)
  Capybara.register_driver(:custom_playwright) do |app|
    Capybara::Playwright::Driver.new(app, headless: ENV["CI"].present?)
  end
end
