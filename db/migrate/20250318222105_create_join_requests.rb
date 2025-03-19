# typed: true
# frozen_string_literal: true

class CreateJoinRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :join_requests, id: :uuid do |t|
      t.belongs_to :user, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false
      t.string :phone_number, null: false
      t.index %i[user_id phone_number],
              unique: true,
              name: "index_join_requests_uniqueness"

      t.timestamps
    end

    change_table :friends do |t|
      t.belongs_to :join_request, foreign_key: true, type: :uuid
    end
  end
end
