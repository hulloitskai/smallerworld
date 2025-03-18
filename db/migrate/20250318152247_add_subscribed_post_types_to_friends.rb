# typed: true
# frozen_string_literal: true

class AddSubscribedPostTypesToFriends < ActiveRecord::Migration[8.0]
  def change
    add_column :friends,
               :subscribed_post_types,
               :string,
               array: true,
               null: false,
               default: %i[journal_entry poem invitation question]
    change_column_default :friends, :subscribed_post_types, from: [], to: nil
  end
end
