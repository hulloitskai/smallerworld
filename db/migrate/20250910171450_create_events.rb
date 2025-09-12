# typed: true
# frozen_string_literal: true

class CreateEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :events, id: :uuid do |t|
      t.belongs_to :community, null: true, foreign_key: true, type: :uuid
      t.string :registration_url, null: false
      t.timestamptz :starts_at, null: false
      t.timestamptz :ends_at
      t.string :name, null: false
      t.text :description, null: false
      t.belongs_to :created_by,
                   null: false,
                   foreign_key: { to_table: :users },
                   type: :uuid

      t.timestamps
    end
  end
end
