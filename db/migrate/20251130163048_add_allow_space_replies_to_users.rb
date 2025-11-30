# typed: true
# frozen_string_literal: true

class AddAllowSpaceRepliesToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users,
               :allow_space_replies,
               :boolean,
               null: false,
               default: true

    change_table :worlds do |t|
      t.change_default :allow_friend_sharing, true
      t.change_default :hide_neko, false
      t.change_default :hide_stats, false
    end
  end
end
