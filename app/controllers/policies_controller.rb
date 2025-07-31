# typed: true
# frozen_string_literal: true

class PoliciesController < ApplicationController
  # GET /policies
  def show
    render(inertia: "PoliciesPage")
  end
end
