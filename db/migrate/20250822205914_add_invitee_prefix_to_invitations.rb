# typed: true
# frozen_string_literal: true

class AddInviteePrefixToInvitations < ActiveRecord::Migration[8.0]
  def change
    change_table :invitations do |t|
      t.rename :name, :invitee_name
      t.rename :emoji, :invitee_emoji
    end
  end
end
