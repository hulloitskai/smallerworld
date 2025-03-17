# typed: true
# frozen_string_literal: true

class CreateNotifications < ActiveRecord::Migration[7.1]
  def change
    create_table :notifications, id: :uuid do |t|
      t.timestamptz :delivered_at
      t.string :delivery_token, null: false, index: { unique: true }
      t.belongs_to :noticeable, polymorphic: true, null: false, type: :uuid
      t.belongs_to :recipient,
                   polymorphic: true,
                   null: false,
                   type: :uuid,
                   index: true
      t.timestamptz :pushed_at

      t.timestamps
    end
  end
end
