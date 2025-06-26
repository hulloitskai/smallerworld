# typed: true
# frozen_string_literal: true

class FilesController < ApplicationController
  # == Actions
  # GET /files/:signed_id
  def show
    blob = load_blob
    render(json: { file: FileSerializer.one(blob) })
  end

  private

  # == Helpers
  sig { params(scope: T.untyped).returns(ActiveStorage::Blob) }
  def load_blob(scope: ActiveStorage::Blob.all)
    scope.find_signed!(params.fetch(:signed_id))
  end
end
