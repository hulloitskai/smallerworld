# typed: true
# frozen_string_literal: true

class IndexPostsOnAuthorIdAndCreatedAt < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def up
    add_index :posts, %i[author_id created_at], algorithm: :concurrently
  end

  def down
    remove_index :posts, %i[author_id created_at], algorithm: :concurrently
  end
end
