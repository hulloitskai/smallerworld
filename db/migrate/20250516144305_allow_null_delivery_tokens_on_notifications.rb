# typed: true
# frozen_string_literal: true

class AllowNullDeliveryTokensOnNotifications < ActiveRecord::Migration[8.0]
  def change
    change_column_null :notifications, :delivery_token, true
  end
end
