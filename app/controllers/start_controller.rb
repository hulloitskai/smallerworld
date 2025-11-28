# typed: true
# frozen_string_literal: true

class StartController < ApplicationController
  # == Actions ==

  # GET /start
  def web
    respond_to do |format|
      format.html do
        next_path = if (user = current_user) && user.world.present?
          user_world_path(trailing_slash: true)
        elsif current_user || valid_registration_token?
          new_registration_path
        else
          root_path
        end
        redirect_to(next_path)
      end
    end
  end

  # GET /start/pwa
  def pwa
    respond_to do |format|
      format.html do
        next_path = if (user = current_user) && user.world.present?
          user_world_path(trailing_slash: true)
        elsif current_user || valid_registration_token?
          new_registration_path
        else
          # TODO: Redirect to spaces
          user_world_path(trailing_slash: true)
        end
        redirect_to(next_path)
      end
    end
  end
end
