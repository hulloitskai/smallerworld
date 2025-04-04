# typed: true
# frozen_string_literal: true

class DropPostAlerts < ActiveRecord::Migration[8.0]
  def change
    drop_table :post_alerts
  end
end
