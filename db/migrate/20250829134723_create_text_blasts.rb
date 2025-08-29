# typed: true
# frozen_string_literal: true

class CreateTextBlasts < ActiveRecord::Migration[8.0]
  def change
    create_table :text_blasts, id: :uuid do |t|
      t.belongs_to :post, null: false, foreign_key: true, type: :uuid
      t.belongs_to :friend, null: false, foreign_key: true, type: :uuid
      t.string :phone_number, null: false

      t.timestamptz :created_at, null: false
      t.timestamptz :sent_at
    end
  end
end
