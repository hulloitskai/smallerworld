# typed: strict
# frozen_string_literal: true

return unless defined?(Capybara)

Capybara.register_driver(:custom_playwright) do |app|
  Capybara::Playwright::Driver.new(
    app,
    playwright_cli_executable_path:
      Rails.root.join("node_modules/.bin/playwright"),
    headless: ENV["CI"].present? || !ENV["PLAYWRIGHT_INTERACTIVE"].truthy?,
  )
end

Capybara.default_driver = :custom_playwright
Capybara.javascript_driver = :custom_playwright
Capybara.default_max_wait_time = 15
