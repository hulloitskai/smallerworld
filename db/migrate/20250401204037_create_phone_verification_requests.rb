# typed: true
# frozen_string_literal: true

class CreatePhoneVerificationRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :phone_verification_requests, id: :uuid do |t|
      t.string :phone_number, null: false
      t.string :verification_code, null: false
      t.timestamptz :verified_at, index: true
      t.timestamps
    end
  end
end
