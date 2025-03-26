# typed: true
# frozen_string_literal: true

class AddThemeToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :theme, :string
  end
end
