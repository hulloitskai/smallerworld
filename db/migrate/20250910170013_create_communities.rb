# typed: true
# frozen_string_literal: true

class CreateCommunities < ActiveRecord::Migration[8.0]
  def change
    create_table :communities, id: :uuid do |t|
      t.string :name, null: false
      t.string :handle, null: false, index: { unique: true }
      t.text :description, null: false

      t.timestamps
    end
  end
end
