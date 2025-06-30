# typed: true
# frozen_string_literal: true

class RegistrationsController < ApplicationController
  # == Actions
  # GET /signup
  def new
    if signed_in?
      redirect_to(after_authentication_url)
    elsif valid_registration_token?
      render(inertia: "RegistrationPage")
    else
      redirect_to(new_session_path, alert: "Please sign in to continue.")
    end
  end

  # POST /signup
  def create
    registration_token = self.registration_token or
      raise "Missing registration token"
    verification_request = PhoneVerificationRequest
      .find_by_registration_token!(registration_token)
    verified_phone_number = verification_request.verified_phone_number
    unless verified_phone_number
      self.registration_token = nil
      raise "Phone number not verified"
    end

    user_params = params.expect(user: %i[
      name
      handle
      page_icon
      time_zone_name
      hide_stats
      hide_neko
    ])
    user = User.new(**user_params, phone_number: verified_phone_number)
    if user.save
      session.delete(:registration_token)
      start_new_session_for!(user)
      render(json: { user: UserSerializer.one(user) })
    else
      render(json: { errors: user.form_errors }, status: :unprocessable_entity)
    end
  end
end
