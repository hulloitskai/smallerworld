# typed: true
# frozen_string_literal: true

class FeedbackController < ApplicationController
  CANNY_URL = T.let(
    Addressable::URI.parse("https://smallerworld.canny.io"),
    Addressable::URI,
  )

  # == Actions
  # GET /feedback
  def redirect
    url = CANNY_URL.dup
    url.query_values = params.permit("clientToken")
    redirect_to(url.to_s, allow_other_host: true, status: :found)
  end
end
