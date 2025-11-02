# typed: true
# frozen_string_literal: true

class LoginRequestsController < ApplicationController
  # == Filters
  rate_limit to: 10,
             within: 3.minutes,
             only: :create,
             with: :handle_rate_limit_exceeded

  # == Actions
  # POST /login_requests
  def create
    login_request_params = params.expect(
      login_request: [:phone_number],
    )
    login_request = LoginRequest.new(login_request_params)
    tag_logger do
      logger.info(
        "Sending login code #{login_request.login_code} to " \
          "#{login_request.phone_number}",
      )
    end
    if login_request.save
      data = if Rails.env.production?
        {}
      else
        { "loginRequest" => LoginRequestSerializer.one(login_request) }
      end
      render(json: data, status: :created)
    else
      render(
        json: {
          errors: login_request.form_errors,
        },
        status: :unprocessable_entity,
      )
    end
  end

  private

  # == Handlers
  sig { void }
  def handle_rate_limit_exceeded
    error = "You have requested a login code too many times. Please try " \
      "again later."
    render(json: { error: }, status: :too_many_requests)
  end
end
