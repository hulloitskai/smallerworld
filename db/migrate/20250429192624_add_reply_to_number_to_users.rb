# typed: true
# frozen_string_literal: true

class AddReplyToNumberToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :reply_to_number, :string
  end
end
