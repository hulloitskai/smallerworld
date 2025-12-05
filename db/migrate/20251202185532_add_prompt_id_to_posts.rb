# typed: true
# frozen_string_literal: true

class AddPromptIdToPosts < ActiveRecord::Migration[8.0]
  def change
    add_column :posts, :prompt_id, :string
    add_index :posts, :prompt_id
  end
end
