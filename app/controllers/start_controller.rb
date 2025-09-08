# typed: true
# frozen_string_literal: true

class StartController < ApplicationController
  # == Actions
  # GET /start
  def redirect
    next_path = if signed_in?
      world_path
    elsif valid_registration_token?
      signup_path
    else
      root_path
    end
    redirect_to(next_path)
  end
end
