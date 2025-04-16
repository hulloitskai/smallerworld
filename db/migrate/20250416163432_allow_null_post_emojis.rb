# typed: true
# frozen_string_literal: true

class AllowNullPostEmojis < ActiveRecord::Migration[8.0]
  def change
    change_column_null :posts, :emoji, true
  end
end
