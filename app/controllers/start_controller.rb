# typed: true
# frozen_string_literal: true

class StartController < ApplicationController
  # == Actions ==

  # GET /start
  def redirect
    respond_to do |format|
      format.html do
        next_path = if signed_in?
          user_world_path(trailing_slash: true)
        elsif valid_registration_token?
          new_registration_path
        else
          root_path
        end
        redirect_to(next_path)
      end
    end
  end
end
