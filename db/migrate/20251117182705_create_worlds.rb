# typed: true
# frozen_string_literal: true

class CreateWorlds < ActiveRecord::Migration[8.0]
  def change
    # == Worlds
    create_table :worlds, id: :uuid do |t|
      t.string :allow_friend_sharing, null: false
      t.string :handle, null: false, index: { unique: true }
      t.string :hide_neko, null: false
      t.string :hide_stats, null: false
      t.string :reply_to_number_override
      t.string :theme
      t.belongs_to :owner,
                   null: false,
                   foreign_key: { to_table: "users" },
                   type: :uuid

      t.timestamps
    end

    # == Users
    up_only do
      execute <<~SQL.squish
        INSERT INTO worlds (id, created_at, updated_at, owner_id, allow_friend_sharing, hide_neko, hide_stats, theme, handle)
        SELECT gen_random_uuid(), created_at, updated_at, id, allow_friend_sharing, hide_neko, hide_stats, theme, handle
        FROM users
      SQL
    end

    change_table :users do |t|
      t.rename :reply_to_number, :deprecated_reply_to_number
      t.rename :hide_neko, :deprecated_hide_neko
      t.rename :hide_stats, :deprecated_hide_stats
      t.rename :allow_friend_sharing, :deprecated_allow_friend_sharing
      t.rename :theme, :deprecated_theme
      t.rename :handle, :deprecated_handle

      t.change_null :deprecated_hide_neko, true
      t.change_null :deprecated_hide_stats, true
      t.change_null :deprecated_allow_friend_sharing, true
      t.change_null :deprecated_handle, true
    end

    # == Icons
    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          UPDATE active_storage_attachments
          SET record_type = 'World', record_id = worlds.id, name = 'icon'
          FROM worlds
          WHERE active_storage_attachments.record_id = worlds.owner_id
          AND active_storage_attachments.record_type = 'User'
          AND active_storage_attachments.name = 'page_icon'
        SQL
      end
      dir.down do
        execute <<~SQL.squish
          UPDATE active_storage_attachments
          SET record_type = 'User', record_id = worlds.owner_id, name = 'page_icon'
          FROM worlds
          WHERE active_storage_attachments.record_type = 'World'
          AND active_storage_attachments.record_id = worlds.id
        SQL
      end
    end

    # == Friends
    add_belongs_to :friends, :world, type: :uuid, foreign_key: true
    up_only do
      execute <<~SQL.squish
        UPDATE friends
        SET world_id = worlds.id
        FROM worlds
        WHERE friends.user_id = worlds.owner_id
      SQL
    end
    change_table :friends do |t|
      t.change_null :world_id, false
      t.remove_index name: "index_friends_name_uniqueness",
                     column: %i[name user_id],
                     unique: true
      t.remove_index name: "index_friends_phone_number_uniqueness",
                     column: %i[user_id phone_number],
                     unique: true
      t.remove_index :chosen_family
      t.rename :user_id, :deprecated_user_id
      t.change_null :deprecated_user_id, true
      t.index %i[world_id name],
              unique: true,
              name: "index_friends_name_uniqueness"
      t.index %i[world_id phone_number],
              unique: true,
              name: "index_friends_phone_number_uniqueness"
    end

    # == Join Requests
    add_belongs_to :join_requests,
                   :world,
                   type: :uuid,
                   foreign_key: true
    up_only do
      execute <<~SQL.squish
        UPDATE join_requests
        SET world_id = worlds.id
        FROM worlds
        WHERE join_requests.user_id = worlds.owner_id
      SQL
    end
    change_table :join_requests do |t|
      t.change_null :world_id, false
      t.remove_index name: "index_join_requests_uniqueness",
                     column: %i[user_id phone_number],
                     unique: true
      t.rename :user_id, :deprecated_user_id
      t.change_null :deprecated_user_id, true
      t.index %i[world_id phone_number],
              unique: true,
              name: "index_join_requests_uniqueness"
    end

    # == Invitations
    add_belongs_to :invitations,
                   :world,
                   type: :uuid,
                   foreign_key: true
    up_only do
      execute <<~SQL.squish
        UPDATE invitations
        SET world_id = worlds.id
        FROM worlds
        WHERE invitations.user_id = worlds.owner_id
      SQL
    end
    change_table :invitations do |t|
      t.change_null :world_id, false
      t.remove_index name: "index_invitations_invitee_name_uniqueness",
                     column: %i[invitee_name user_id],
                     unique: true
      t.rename :user_id, :deprecated_user_id
      t.change_null :deprecated_user_id, true
      t.index %i[world_id invitee_name],
              unique: true,
              name: "index_invitations_invitee_name_uniqueness"
    end

    # == Activities
    add_belongs_to :activities, :world, type: :uuid, foreign_key: true
    up_only do
      execute <<~SQL.squish
        UPDATE activities
        SET world_id = worlds.id
        FROM worlds
        WHERE activities.user_id = worlds.owner_id
      SQL
    end
    change_table :activities do |t|
      t.change_null :world_id, false
      t.remove_index column: %i[user_id template_id], unique: true
      t.rename :user_id, :deprecated_user_id
      t.change_null :deprecated_user_id, false
      t.index %i[world_id template_id],
              unique: true,
              name: "index_activities_uniqueness"
    end

    # == Posts
    add_belongs_to :posts, :world, type: :uuid, foreign_key: true
    up_only do
      execute <<~SQL.squish
        UPDATE posts
        SET world_id = worlds.id
        FROM worlds
        WHERE posts.author_id = worlds.owner_id
      SQL
    end
  end
end
