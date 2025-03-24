# typed: true
# frozen_string_literal: true

class AddPinnedUntilToPosts < ActiveRecord::Migration[8.0]
  def change
    add_column :posts, :pinned_until, :timestamptz
    add_index :posts, :pinned_until
  end
end
