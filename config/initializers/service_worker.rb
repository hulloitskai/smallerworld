# typed: true
# frozen_string_literal: true

Rails.application.configure do
  config.middleware.use(ServiceWorkerApp)
end

Rails.backtrace_cleaner.add_silencer do |line|
  line.start_with?("lib/service_worker_app.rb")
end
