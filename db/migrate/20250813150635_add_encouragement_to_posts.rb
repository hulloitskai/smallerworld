# typed: true
# frozen_string_literal: true

class AddEncouragementToPosts < ActiveRecord::Migration[8.0]
  def change
    add_reference :posts,
                  :encouragement,
                  null: true,
                  foreign_key: true,
                  type: :uuid
  end
end
