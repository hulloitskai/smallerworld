# typed: true
# frozen_string_literal: true

class IndexPostsForSearch < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      CREATE INDEX index_posts_for_search ON posts USING gin (
        (
          to_tsvector('simple', coalesce(("posts"."emoji")::text, '')) ||
          to_tsvector('simple', coalesce(("posts"."title")::text, '')) ||
          to_tsvector('simple', coalesce(("posts"."body_html")::text, ''))
        )
      );
    SQL
  end

  def down
    remove_index :posts, name: :index_posts_for_search
  end
end
