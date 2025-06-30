# typed: true
# frozen_string_literal: true

class AddHideNekoToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :hide_neko, :boolean
    execute "UPDATE users SET hide_neko = false WHERE hide_neko IS NULL"
    change_column_null :users, :hide_neko, false
  end
end
