# typed: true
# frozen_string_literal: true

class AllowNullRecipientsOnNotifications < ActiveRecord::Migration[8.0]
  def change
    change_table :notifications do |t|
      t.change_null :recipient_id, true
      t.change_null :recipient_type, true
    end
  end
end
