# typed: true
# frozen_string_literal: true

class RenameDeliveryTokenToDeprecatedDeliveryTokenOnNotifications < ActiveRecord::Migration[8.0] # rubocop:disable Layout/LineLength
  def change
    rename_column :notifications, :delivery_token, :deprecated_delivery_token
  end
end
