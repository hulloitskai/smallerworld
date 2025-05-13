# typed: true
# frozen_string_literal: true

class ImagesController < ApplicationController
  # == Actions
  # GET /images/:signed_id
  def show
    image = maybe_find_image
    render(json: { image: ImageSerializer.one_if(image) })
  end

  private

  # == Helpers
  sig { returns(T.nilable(ImageModel)) }
  def maybe_find_image
    signed_id = params[:signed_id] or
      raise ActionController::ParameterMissing, "Missing signed ID"
    if (blob = ActiveStorage::Blob.find_signed(signed_id))
      blob.becomes(ImageModel)
    end
  end
end
