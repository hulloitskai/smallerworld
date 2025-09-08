# typed: true
# frozen_string_literal: true

class LandingController < ApplicationController
  # == Actions
  # GET /
  def show
    render(inertia: "LandingPage")
  end
end
