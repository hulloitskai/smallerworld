# typed: true
# frozen_string_literal: true

class LandingController < ApplicationController
  # == Actions ==

  # GET /
  def show
    respond_to do |format|
      format.html do
        render(inertia: "LandingPage")
      end
    end
  end
end
