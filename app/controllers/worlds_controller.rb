# typed: true
# frozen_string_literal: true

class WorldsController < ApplicationController
  # == Filters
  before_action :authenticate_user!

  # == Actions
  # GET /world
  def show
    render(inertia: "WorldPage")
  end
end
