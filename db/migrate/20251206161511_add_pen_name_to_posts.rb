# typed: true
# frozen_string_literal: true

class AddPenNameToPosts < ActiveRecord::Migration[8.0]
  def change
    add_column :posts, :pen_name, :string
  end
end
