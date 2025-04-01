# typed: true
# frozen_string_literal: true

class CreatePostAlerts < ActiveRecord::Migration[8.0]
  def change
    create_table :post_alerts, id: :uuid do |t|
      t.belongs_to :post, null: false, foreign_key: true, type: :uuid
      t.timestamptz :scheduled_for
      t.text :message, null: false

      t.timestamps
    end
  end
end
