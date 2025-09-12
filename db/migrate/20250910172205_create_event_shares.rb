# typed: true
# frozen_string_literal: true

class CreateEventShares < ActiveRecord::Migration[8.0]
  def change
    create_table :event_shares, id: :uuid do |t|
      t.belongs_to :sharer,
                   null: false,
                   foreign_key: { to_table: :users },
                   type: :uuid
      t.belongs_to :event, null: false, foreign_key: true, type: :uuid
      t.string :emoji, null: false
      t.text :comment, null: false

      t.timestamps
    end
  end
end
