# typed: true
# frozen_string_literal: true

class CreateInvitations < ActiveRecord::Migration[8.0]
  def change
    create_table :invitations, id: :uuid do |t|
      t.belongs_to :user, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false
      t.string :emoji
      t.uuid :offered_activity_ids, null: false, array: true, default: []

      t.timestamps
    end

    change_table :friends do |t|
      t.belongs_to :invitation, foreign_key: true, type: :uuid
    end
  end
end
