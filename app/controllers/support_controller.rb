# typed: true
# frozen_string_literal: true

class SupportController < ApplicationController
  # == Filters
  before_action :authenticate_user!, only: :success

  # == Actions
  # GET /support
  def redirect
    redirect_to(
      "https://www.zeffy.com/ticketing/join-our-community",
      allow_other_host: true,
      status: :found,
    )
  end

  # GET /support/success
  def success
    render(inertia: "PaymentSuccessPage")
  end
end
