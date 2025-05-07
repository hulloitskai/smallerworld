# typed: true
# frozen_string_literal: true

Rails.application.configure do
  config.middleware.use(ServiceWorkerProxy)
end

Rails.backtrace_cleaner.add_silencer do |line|
  line.start_with?("lib/service_worker_proxy.rb")
end
