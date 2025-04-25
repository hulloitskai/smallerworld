# typed: true
# frozen_string_literal: true

class AllowNilOwnerOnPushRegistrations < ActiveRecord::Migration[8.0]
  def change
    change_table :push_registrations do |t|
      t.change_null :owner_id, true
      t.change_null :owner_type, true
    end
  end
end
