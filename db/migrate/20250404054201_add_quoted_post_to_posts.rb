# typed: true
# frozen_string_literal: true

class AddQuotedPostToPosts < ActiveRecord::Migration[8.0]
  def change
    add_reference :posts,
                  :quoted_post,
                  foreign_key: { to_table: "posts" },
                  type: :uuid
  end
end
