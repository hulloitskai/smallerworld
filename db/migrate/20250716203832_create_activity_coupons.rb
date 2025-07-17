# typed: true
# frozen_string_literal: true

class CreateActivityCoupons < ActiveRecord::Migration[8.0]
  def change
    create_table :activity_coupons, id: :uuid do |t|
      t.belongs_to :friend, null: false, foreign_key: true, type: :uuid
      t.belongs_to :activity, null: false, foreign_key: true, type: :uuid
      t.timestamptz :expires_at, null: false, index: true

      t.timestamps
    end
  end
end
