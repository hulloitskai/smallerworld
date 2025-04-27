# typed: true
# frozen_string_literal: true

class ImagesController < ApplicationController
  # == Actions
  # GET /images/:signed_id
  def show
    blob = maybe_find_blob
    render(json: { image: ImageSerializer.one_if(blob) })
  end

  private

  # == Helpers
  sig { returns(T.nilable(ActiveStorage::Blob)) }
  def maybe_find_blob
    signed_id = params[:signed_id] or
      raise ActionController::ParameterMissing, "Missing signed ID"
    ActiveStorage::Blob.find_signed(signed_id)
  end
end
