# typed: true
# frozen_string_literal: true

class CreateCommunityMemberships < ActiveRecord::Migration[8.0]
  def change
    create_table :community_memberships, id: :uuid do |t|
      t.belongs_to :member,
                   null: false,
                   foreign_key: { to_table: :users },
                   type: :uuid
      t.belongs_to :community, null: false, foreign_key: true, type: :uuid
      t.string :role, null: false

      t.timestamps
    end
  end
end
