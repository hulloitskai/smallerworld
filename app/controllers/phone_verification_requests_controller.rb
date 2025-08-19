# typed: true
# frozen_string_literal: true

class PhoneVerificationRequestsController < ApplicationController
  # == Filters
  rate_limit to: 10,
             within: 3.minutes,
             only: :create,
             with: :handle_rate_limit_exceeded

  # == Actions
  # POST /phone_verification_requests
  def create
    verification_request_params = params.expect(
      verification_request: [:phone_number],
    )
    verification_request = PhoneVerificationRequest
      .new(verification_request_params)
    tag_logger do
      logger.info(
        "Sending verification code #{verification_request.verification_code} " \
          "to #{verification_request.phone_number}",
      )
    end
    if verification_request.save
      if !Rails.env.production?
        render(json: {
          "verificationRequest" => PhoneVerificationRequestSerializer
            .one(verification_request),
        })
      else
        render(json: {})
      end
    else
      render(
        json: { errors: verification_request.form_errors },
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
