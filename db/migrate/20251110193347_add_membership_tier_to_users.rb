# typed: true
# frozen_string_literal: true

class AddMembershipTierToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :membership_tier, :string
    add_index :users, :membership_tier
  end
end
