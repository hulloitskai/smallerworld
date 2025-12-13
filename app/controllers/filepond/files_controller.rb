# typed: true
# frozen_string_literal: true

module Filepond
  class FilesController < ApplicationController
    # == Actions ==

    # DELETE /filepond/files/:signed_id
    def destroy
      signed_id = params.expect!(:signed_id)
      if (blob = ActiveStorage::Blob.find_signed(signed_id))
        blob.purge
        head :ok
      else
        head :not_found
      end
    end
  end
end
