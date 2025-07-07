# typed: true
# frozen_string_literal: true

class ImagesController < ApplicationController
  # == Filters
  before_action :authenticate_user!, only: :download

  # == Actions
  # GET /images/:signed_id
  def show
    image = maybe_find_image
    render(json: { image: ImageSerializer.one_if(image) })
  end

  # GET /images/:signed_id/download
  def download
    image = maybe_find_image
    authorize!(image)
    redirect_to(rails_representation_path(image), disposition: :attachment)
  end

  private

  # == Helpers
  sig { returns(T.nilable(Image)) }
  def maybe_find_image
    if (blob = ActiveStorage::Blob.find_signed(params.fetch(:signed_id)))
      blob.becomes(Image)
    end
  end
end
