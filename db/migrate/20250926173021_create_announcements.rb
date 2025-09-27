# typed: true
# frozen_string_literal: true

class CreateAnnouncements < ActiveRecord::Migration[8.0]
  def change
    create_table :announcements, id: :uuid do |t|
      t.text :message, null: false
      t.timestamptz :created_at, null: false
      t.string :test_recipient_phone_number
    end
  end
end
