# typed: true
# frozen_string_literal: true

class AddImagesIdsToPosts < ActiveRecord::Migration[8.0]
  def change
    add_column :posts, :images_ids, :uuid, array: true, null: false, default: []
  end
end
