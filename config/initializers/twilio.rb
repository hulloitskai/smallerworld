# typed: true
# frozen_string_literal: true

app_credentials = Rails.application.credentials
twilio_credentials = if Rails.application.credentials_available? &&
    Rails.env.production?
  app_credentials.twilio!
else
  app_credentials.twilio
end

Twilio.configure do |config|
  config.logger = Rails.logger
  if twilio_credentials
    config.account_sid = twilio_credentials.account_sid!
    config.auth_token = twilio_credentials.auth_token!
  end
end
