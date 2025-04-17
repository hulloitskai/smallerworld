# typed: true
# frozen_string_literal: true

class SessionsController < ApplicationController
  # == Actions
  # GET /login
  def new
    if signed_in?
      redirect_to(world_path, notice: "You are already signed in :)")
    else
      render(inertia: "LoginPage")
    end
  end

  # POST /login
  def create
    login_params = params.expect(login: %i[phone_number verification_code])
    phone_number, verification_code = login_params
      .values_at(:phone_number, :verification_code)
    if (verification_request = PhoneVerificationRequest.find_valid(
      phone_number:,
      verification_code:,
    ))
      if (user = User.find_by_phone_number(phone_number))
        start_new_session_for!(user)
        render(json: {
          "redirectUrl" => after_authentication_url,
        })
      else
        session[:registration_token] =
          verification_request.generate_registration_token
        render(json: {
          "redirectUrl" => new_registration_path,
        })
      end
      verification_request.mark_as_verified!
    else
      special_occasion_verification_code = Rails.application.credentials
        .authentication
        &.special_occasion_verification_code
      user = User.find_by_phone_number(phone_number)
      if verification_code == special_occasion_verification_code && user
        start_new_session_for!(user)
        render(json: {
          "redirectUrl" => after_authentication_url,
        })
      else
        render(
          json: {
            errors: { verification_code: "Invalid verification code" },
          },
          status: :unprocessable_entity,
        )
      end
    end
  end

  # POST /logout
  def destroy
    terminate_session!
    render(json: {})
  end
end
