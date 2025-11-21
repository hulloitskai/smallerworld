# typed: true
# frozen_string_literal: true

class CreateSpaces < ActiveRecord::Migration[8.0]
  def change
    create_table :spaces, id: :uuid do |t|
      t.belongs_to :owner,
                   null: false,
                   foreign_key: { to_table: "users" },
                   type: :uuid
      t.string :name, null: false
      t.text :description, null: false

      t.timestamps
      t.index %i[owner_id name],
              unique: true,
              name: "index_spaces_owner_name_uniqueness"
    end

    change_table :posts do |t|
      t.belongs_to :space, type: :uuid
    end
  end
end
