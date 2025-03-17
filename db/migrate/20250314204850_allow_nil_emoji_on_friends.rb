# typed: true
# frozen_string_literal: true

class AllowNilEmojiOnFriends < ActiveRecord::Migration[8.0]
  def change
    change_column_null :friends, :emoji, true
  end
end
