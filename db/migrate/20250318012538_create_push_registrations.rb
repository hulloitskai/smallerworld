# typed: true
# frozen_string_literal: true

class CreatePushRegistrations < ActiveRecord::Migration[8.0]
  def change
    up_only do
      execute "DELETE FROM push_subscriptions"
    end

    create_table :push_registrations, id: :uuid do |t|
      t.belongs_to :owner, polymorphic: true, null: false, type: :uuid
      t.belongs_to :push_subscription,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.timestamptz :created_at, null: false
      t.index %i[owner_type owner_id push_subscription_id],
              unique: true,
              name: "index_push_registrations_uniqueness"
    end

    change_table :push_subscriptions do |t|
      t.remove :owner_id, type: :uuid, null: false
      t.remove :owner_type, type: :string, null: false
    end
  end
end
