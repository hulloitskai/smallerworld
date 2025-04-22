# typed: true
# frozen_string_literal: true

class AddHideStatsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :hide_stats, :boolean
    up_only do
      execute "UPDATE users SET hide_stats = false WHERE hide_stats IS NULL"
    end
    change_column_null :users, :hide_stats, false
  end
end
