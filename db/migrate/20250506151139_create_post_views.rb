# typed: true
# frozen_string_literal: true

class CreatePostViews < ActiveRecord::Migration[8.0]
  def change
    create_table :post_views, id: :uuid do |t|
      t.belongs_to :post, null: false, foreign_key: true, type: :uuid
      t.belongs_to :friend, null: false, foreign_key: true, type: :uuid
      t.index %i[friend_id post_id],
              unique: true,
              name: "index_post_views_uniqueness"

      t.timestamptz :created_at, null: false
    end
  end
end
