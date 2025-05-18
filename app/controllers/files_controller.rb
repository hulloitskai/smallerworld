# typed: true
# frozen_string_literal: true

class FilesController < ApplicationController
  # == Actions
  # GET /files/:signed_id
  def show
    blob = find_blob
    render(json: { file: FileSerializer.one(blob) })
  end

  private

  # == Helpers
  sig { returns(ActiveStorage::Blob) }
  def find_blob
    ActiveStorage::Blob.find_signed!(params.fetch(:signed_id))
  end
end
