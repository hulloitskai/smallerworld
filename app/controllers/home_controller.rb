# typed: true
# frozen_string_literal: true

class HomeController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /home
  def show
    render(inertia: "HomePage")
  end
end
