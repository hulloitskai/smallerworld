# typed: true
# frozen_string_literal: true

class AttachMultipleImagesPerPost < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      UPDATE active_storage_attachments
      SET name = 'images'
      WHERE name = 'image'
      AND record_type = 'Post'
    SQL
  end

  def down
    execute <<~SQL.squish
      UPDATE active_storage_attachments
      SET name = 'image'
      WHERE name = 'images'
      AND record_type = 'Post'
    SQL
  end
end
