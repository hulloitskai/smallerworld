# typed: true
# frozen_string_literal: true

class CreateEncouragements < ActiveRecord::Migration[8.0]
  def change
    create_table :encouragements, id: :uuid do |t|
      t.belongs_to :friend, null: false, foreign_key: true, type: :uuid
      t.string :emoji, null: false
      t.text :message, null: false

      t.timestamptz :created_at, null: false, index: true
    end
  end
end
