# typed: true
# frozen_string_literal: true

class StartController < ApplicationController
  # == Actions ==

  # GET /start
  def web
    respond_to do |format|
      format.html do
        start_path = if (user = current_user)
          if user.world.present? || user.spaces.none?
            user_world_path
          else
            user_spaces_path
          end
        elsif current_user || valid_registration_token?
          new_registration_path
        else
          root_path
        end
        redirect_to(start_path)
      end
    end
  end

  # GET /start/pwa
  def pwa
    respond_to do |format|
      format.html do
        next_path = if (user = current_user) && user.world.present?
          user_world_path
        else
          user_spaces_path
        end
        redirect_to(next_path)
      end
    end
  end

  # GET /start/app
  def app
    respond_to do |format|
      format.html do
        if signed_in?
          redirect_to(user_spaces_path)
        else
          render(inertia: "SplashPage")
        end
      end
    end
  end
end
