# typed: true
# frozen_string_literal: true

class SupportController < ApplicationController
  # == Filters ==

  before_action :authenticate_user!, only: :success

  # == Actions ==

  # GET /support
  def redirect
    respond_to do |format|
      format.html do
        redirect_to(
          "https://www.zeffy.com/ticketing/join-our-community",
          allow_other_host: true,
          status: :found,
        )
      end
    end
  end

  # GET /support/success
  def success
    respond_to do |format|
      format.html do
        render(inertia: "PaymentSuccessPage")
      end
    end
  end
end
