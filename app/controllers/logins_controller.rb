# typed: true
# frozen_string_literal: true

class LoginsController < ApplicationController
  # == Actions
  # GET /login
  def new
    if signed_in?
      redirect_to(home_path, notice: "you are already signed in :)")
    elsif supabase_authenticated?
      redirect_to(signup_path)
    else
      render(inertia: "LoginPage")
    end
  end
end
