# typed: true
# frozen_string_literal: true

class SignupsController < ApplicationController
  # == Filters
  before_action :require_supabase_authentication!

  # == Actions
  # GET /signup
  def new
    if signed_in?
      redirect_to(home_path)
    else
      render(inertia: "SignupPage")
    end
  end

  # POST /signup
  def create
    auth_claims = supabase_auth_claims or raise "Missing Supabase auth claims"
    user_params = params.expect(user: %i[name handle page_icon])
    user = User.new(user_params) do |user|
      user.id = auth_claims.fetch("sub")
      user.phone_number = auth_claims.fetch("phone")
    end
    if user.save
      render(json: { user: UserSerializer.one(user) })
    else
      render(json: { errors: user.form_errors }, status: :unprocessable_entity)
    end
  end
end
