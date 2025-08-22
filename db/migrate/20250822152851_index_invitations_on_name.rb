# typed: true
# frozen_string_literal: true

class IndexInvitationsOnName < ActiveRecord::Migration[8.0]
  def change
    add_index :invitations,
              %i[name user_id],
              unique: true,
              name: "index_invitations_uniqueness"
  end
end
