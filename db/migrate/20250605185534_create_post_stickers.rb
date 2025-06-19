# typed: true
# frozen_string_literal: true

class CreatePostStickers < ActiveRecord::Migration[8.0]
  def change
    create_table :post_stickers, id: :uuid do |t|
      t.belongs_to :post, null: false, foreign_key: true, type: :uuid
      t.belongs_to :friend, null: false, foreign_key: true, type: :uuid
      t.string :emoji, null: false, index: true
      t.float :relative_position_x, null: false
      t.float :relative_position_y, null: false

      t.timestamptz :created_at, null: false
    end
  end
end
