# typed: true
# frozen_string_literal: true

class SessionsController < ApplicationController
  # == Actions ==

  # GET /login
  def new
    respond_to do |format|
      format.html do
        pwa_scope = params[:pwa_scope]
        if signed_in?
          redirect_to(
            world_path(pwa_scope:, trailing_slash: true),
            notice: "You are already signed in :)",
          )
        else
          render(inertia: "LoginPage")
        end
      end
    end
  end

  # POST /login
  def create
    respond_to do |format|
      format.json do
        login_params = params.expect(login: %i[phone_number login_code])
        if (login_request = LoginRequest.find_valid(
          **login_params.to_h.symbolize_keys,
        ))
          registered = if (user = User.find_by_phone_number(
            login_request.phone_number,
          ))
            start_new_session_for!(user)
            true
          else
            self.registration_token = login_request.generate_registration_token
            false
          end
          login_request.mark_as_completed!
          render(json: { registered: })
        else
          render(
            json: {
              errors: { login_code: "Invalid login code" },
            },
            status: :unprocessable_entity,
          )
        end
      end
    end
  end

  # POST /logout
  def destroy
    respond_to do |format|
      format.json do
        terminate_session!
        render(json: {})
      end
    end
  end
end
