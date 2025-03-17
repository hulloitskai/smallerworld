# typed: true
# frozen_string_literal: true

class CreatePushSubscriptions < ActiveRecord::Migration[7.1]
  def change
    create_table :push_subscriptions, id: :uuid do |t|
      t.string :auth_key, null: false
      t.string :endpoint, null: false, index: { unique: true }
      t.string :p256dh_key, null: false
      t.belongs_to :owner,
                   polymorphic: true,
                   null: false,
                   type: :uuid,
                   index: true

      t.timestamps
    end
  end
end
