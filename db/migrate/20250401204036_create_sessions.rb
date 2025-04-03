# typed: true
# frozen_string_literal: true

class CreateSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :sessions, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.inet :ip_address, null: false
      t.string :user_agent, null: false

      t.timestamps
    end
  end
end
