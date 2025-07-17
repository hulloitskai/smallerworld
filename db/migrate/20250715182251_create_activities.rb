# typed: true
# frozen_string_literal: true

class CreateActivities < ActiveRecord::Migration[8.0]
  def change
    create_table :activities, id: :uuid do |t|
      t.string :name, null: false
      t.string :emoji
      t.string :template_id
      t.belongs_to :user, null: false, foreign_key: true, type: :uuid
      t.text :description, null: false
      t.string :location_name, null: false
      t.index %i[user_id template_id], unique: true

      t.timestamps
    end
  end
end
