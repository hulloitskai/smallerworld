# typed: true
# frozen_string_literal: true

class AddRedeemedAtToActivityCoupons < ActiveRecord::Migration[8.0]
  def change
    add_column :activity_coupons, :redeemed_at, :timestamptz
    add_index :activity_coupons, :redeemed_at
  end
end
