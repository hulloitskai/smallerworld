# typed: true
# frozen_string_literal: true

class SessionsController < ApplicationController
  # == Actions
  # GET /login
  def new
    pwa_scope = params[:pwa_scope]
    if signed_in?
      redirect_to(
        world_path(pwa_scope:),
        notice: "You are already signed in :)",
      )
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
      registered = if (user = User.find_by_phone_number(phone_number))
        start_new_session_for!(user)
        true
      else
        self.registration_token =
          verification_request.generate_registration_token
        false
      end
      verification_request.mark_as_verified!
      render(json: { registered: })
    else
      render(
        json: {
          errors: { verification_code: "Invalid verification code" },
        },
        status: :unprocessable_entity,
      )
    end
  end

  # POST /logout
  def destroy
    terminate_session!
    render(json: {})
  end
end
