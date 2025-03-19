# typed: true
# frozen_string_literal: true

class AddChosenFamilyToFriends < ActiveRecord::Migration[8.0]
  def change
    add_column :friends,
               :chosen_family,
               :boolean,
               null: false,
               default: false
    add_index :friends, :chosen_family
    change_column_default :friends, :chosen_family, from: false, to: nil
  end
end
