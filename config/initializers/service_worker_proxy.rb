# typed: true
# frozen_string_literal: true

Rails.application.configure do
  config.middleware.use(ServiceWorkerProxy)
end
