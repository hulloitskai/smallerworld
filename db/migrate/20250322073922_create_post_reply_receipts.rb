# typed: true
# frozen_string_literal: true

class CreatePostReplyReceipts < ActiveRecord::Migration[8.0]
  def change
    create_table :post_reply_receipts, id: :uuid do |t|
      t.belongs_to :post, null: false, foreign_key: true, type: :uuid
      t.belongs_to :friend, null: false, foreign_key: true, type: :uuid
      t.timestamptz :created_at, null: false
    end
  end
end
