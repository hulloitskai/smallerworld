# typed: true
# frozen_string_literal: true

class PoliciesController < ApplicationController
  # == Actions
  # GET /policies
  def show
    render(inertia: "PoliciesPage")
  end
end
