# typed: true
# frozen_string_literal: true

class CreatePosts < ActiveRecord::Migration[8.0]
  def change
    create_table :posts, id: :uuid do |t|
      t.text :body_html, null: false
      t.belongs_to :author,
                   null: false,
                   foreign_key: { to_table: :users },
                   type: :uuid
      t.string :emoji, null: false
      t.string :type, null: false, index: true
      t.string :title

      t.timestamps
    end
  end
end
