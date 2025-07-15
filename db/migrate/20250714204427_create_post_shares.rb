# typed: true
# frozen_string_literal: true

class CreatePostShares < ActiveRecord::Migration[8.0]
  def change
    create_table :post_shares, id: :uuid do |t|
      t.belongs_to :post, null: false, foreign_key: true, type: :uuid
      t.belongs_to :sharer, polymorphic: true, null: false, type: :uuid

      t.timestamptz :created_at, null: false
      t.index %i[post_id sharer_id sharer_type],
              unique: true,
              name: "index_post_shares_uniqueness"
    end
  end
end
