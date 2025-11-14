# typed: true
# frozen_string_literal: true

class PoliciesController < ApplicationController
  # == Actions ==

  # GET /policies
  def show
    respond_to do |format|
      format.html do
        render(inertia: "PoliciesPage")
      end
    end
  end
end
