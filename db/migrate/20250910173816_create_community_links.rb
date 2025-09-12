# typed: true
# frozen_string_literal: true

class CreateCommunityLinks < ActiveRecord::Migration[8.0]
  def change
    create_table :community_links, id: :uuid do |t|
      t.belongs_to :community, null: false, foreign_key: true, type: :uuid
      t.string :type, null: false
      t.string :url, null: false
      t.string :label
    end
  end
end
