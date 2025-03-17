# typed: true
# frozen_string_literal: true

class CreateFriends < ActiveRecord::Migration[8.0]
  def change
    create_table :friends, id: :uuid do |t|
      t.string :name, null: false
      t.string :emoji, null: false
      t.string :phone_number, index: true
      t.belongs_to :user, null: false, foreign_key: true, type: :uuid
      t.string :token, index: { unique: true }

      t.timestamps
    end
  end
end
