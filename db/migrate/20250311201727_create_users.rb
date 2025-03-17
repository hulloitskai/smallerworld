# typed: true
# frozen_string_literal: true

class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users, id: :uuid do |t|
      t.string :name, null: false
      t.string :handle, null: false, index: { unique: true }
      t.string :phone_number, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
