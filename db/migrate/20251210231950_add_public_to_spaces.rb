# typed: true
# frozen_string_literal: true

class AddPublicToSpaces < ActiveRecord::Migration[8.0]
  def change
    add_column :spaces, :public, :boolean, null: false, default: false
  end
end
