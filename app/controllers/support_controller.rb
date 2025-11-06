# typed: true
# frozen_string_literal: true

class SupportController < ApplicationController
  # == Actions
  # GET /support
  def redirect
    redirect_to(
      "https://www.zeffy.com/ticketing/join-our-community",
      allow_other_host: true,
      status: :found,
    )
  end
end
