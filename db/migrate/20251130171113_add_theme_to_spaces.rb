# typed: true
# frozen_string_literal: true

class AddThemeToSpaces < ActiveRecord::Migration[8.0]
  def change
    add_column :spaces, :theme, :string
  end
end
