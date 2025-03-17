# typed: true
# frozen_string_literal: true

class StartController < ApplicationController
  # == Actions
  # GET /start
  def show
    if signed_in?
      redirect_to(home_path)
    elsif supabase_authenticated?
      redirect_to(signup_path)
    else
      redirect_to(root_path)
    end
  end
end
