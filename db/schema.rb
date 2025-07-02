# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_07_02_191912) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.uuid "record_id", null: false
    t.uuid "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "encouragements", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "friend_id", null: false
    t.string "emoji", null: false
    t.text "message", null: false
    t.datetime "created_at", precision: nil, null: false
    t.index ["created_at"], name: "index_encouragements_on_created_at"
    t.index ["friend_id"], name: "index_encouragements_on_friend_id"
  end

  create_table "friends", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "emoji"
    t.string "phone_number"
    t.uuid "user_id", null: false
    t.string "access_token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "paused_since", precision: nil
    t.string "subscribed_post_types", null: false, array: true
    t.boolean "chosen_family", null: false
    t.uuid "join_request_id"
    t.datetime "notifications_last_cleared_at", precision: nil
    t.index ["access_token"], name: "index_friends_on_access_token", unique: true
    t.index ["chosen_family"], name: "index_friends_on_chosen_family"
    t.index ["join_request_id"], name: "index_friends_on_join_request_id"
    t.index ["name", "user_id"], name: "index_friends_uniqueness", unique: true
    t.index ["notifications_last_cleared_at"], name: "index_friends_on_notifications_last_cleared_at"
    t.index ["phone_number"], name: "index_friends_on_phone_number"
    t.index ["user_id"], name: "index_friends_on_user_id"
  end

  create_table "good_job_batches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "description"
    t.jsonb "serialized_properties"
    t.text "on_finish"
    t.text "on_success"
    t.text "on_discard"
    t.text "callback_queue_name"
    t.integer "callback_priority"
    t.datetime "enqueued_at"
    t.datetime "discarded_at"
    t.datetime "finished_at"
    t.datetime "jobs_finished_at"
  end

  create_table "good_job_executions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "active_job_id", null: false
    t.text "job_class"
    t.text "queue_name"
    t.jsonb "serialized_params"
    t.datetime "scheduled_at"
    t.datetime "finished_at"
    t.text "error"
    t.integer "error_event", limit: 2
    t.text "error_backtrace", array: true
    t.uuid "process_id"
    t.interval "duration"
    t.index ["active_job_id", "created_at"], name: "index_good_job_executions_on_active_job_id_and_created_at"
    t.index ["process_id", "created_at"], name: "index_good_job_executions_on_process_id_and_created_at"
  end

  create_table "good_job_processes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "state"
    t.integer "lock_type", limit: 2
  end

  create_table "good_job_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "key"
    t.jsonb "value"
    t.index ["key"], name: "index_good_job_settings_on_key", unique: true
  end

  create_table "good_jobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "queue_name"
    t.integer "priority"
    t.jsonb "serialized_params"
    t.datetime "scheduled_at"
    t.datetime "performed_at"
    t.datetime "finished_at"
    t.text "error"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "active_job_id"
    t.text "concurrency_key"
    t.text "cron_key"
    t.uuid "retried_good_job_id"
    t.datetime "cron_at"
    t.uuid "batch_id"
    t.uuid "batch_callback_id"
    t.boolean "is_discrete"
    t.integer "executions_count"
    t.text "job_class"
    t.integer "error_event", limit: 2
    t.text "labels", array: true
    t.uuid "locked_by_id"
    t.datetime "locked_at"
    t.index ["active_job_id", "created_at"], name: "index_good_jobs_on_active_job_id_and_created_at"
    t.index ["batch_callback_id"], name: "index_good_jobs_on_batch_callback_id", where: "(batch_callback_id IS NOT NULL)"
    t.index ["batch_id"], name: "index_good_jobs_on_batch_id", where: "(batch_id IS NOT NULL)"
    t.index ["concurrency_key"], name: "index_good_jobs_on_concurrency_key_when_unfinished", where: "(finished_at IS NULL)"
    t.index ["cron_key", "created_at"], name: "index_good_jobs_on_cron_key_and_created_at_cond", where: "(cron_key IS NOT NULL)"
    t.index ["cron_key", "cron_at"], name: "index_good_jobs_on_cron_key_and_cron_at_cond", unique: true, where: "(cron_key IS NOT NULL)"
    t.index ["finished_at"], name: "index_good_jobs_jobs_on_finished_at", where: "((retried_good_job_id IS NULL) AND (finished_at IS NOT NULL))"
    t.index ["labels"], name: "index_good_jobs_on_labels", where: "(labels IS NOT NULL)", using: :gin
    t.index ["locked_by_id"], name: "index_good_jobs_on_locked_by_id", where: "(locked_by_id IS NOT NULL)"
    t.index ["priority", "created_at"], name: "index_good_job_jobs_for_candidate_lookup", where: "(finished_at IS NULL)"
    t.index ["priority", "created_at"], name: "index_good_jobs_jobs_on_priority_created_at_when_unfinished", order: { priority: "DESC NULLS LAST" }, where: "(finished_at IS NULL)"
    t.index ["priority", "scheduled_at"], name: "index_good_jobs_on_priority_scheduled_at_unfinished_unlocked", where: "((finished_at IS NULL) AND (locked_by_id IS NULL))"
    t.index ["queue_name", "scheduled_at"], name: "index_good_jobs_on_queue_name_and_scheduled_at", where: "(finished_at IS NULL)"
    t.index ["scheduled_at"], name: "index_good_jobs_on_scheduled_at", where: "(finished_at IS NULL)"
  end

  create_table "join_requests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "name", null: false
    t.string "phone_number", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "phone_number"], name: "index_join_requests_uniqueness", unique: true
    t.index ["user_id"], name: "index_join_requests_on_user_id"
  end

  create_table "notifications", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "delivered_at", precision: nil
    t.string "deprecated_delivery_token"
    t.string "noticeable_type", null: false
    t.uuid "noticeable_id", null: false
    t.string "recipient_type"
    t.uuid "recipient_id"
    t.datetime "pushed_at", precision: nil
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["deprecated_delivery_token"], name: "index_notifications_on_deprecated_delivery_token", unique: true
    t.index ["noticeable_type", "noticeable_id"], name: "index_notifications_on_noticeable"
    t.index ["recipient_type", "recipient_id"], name: "index_notifications_on_recipient"
  end

  create_table "phone_verification_requests", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "phone_number", null: false
    t.string "verification_code", null: false
    t.datetime "verified_at", precision: nil
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["verified_at"], name: "index_phone_verification_requests_on_verified_at"
  end

  create_table "post_reactions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "post_id", null: false
    t.string "emoji", null: false
    t.uuid "friend_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.index ["friend_id"], name: "index_post_reactions_on_friend_id"
    t.index ["post_id", "friend_id", "emoji"], name: "index_post_reactions_uniqueness", unique: true
    t.index ["post_id"], name: "index_post_reactions_on_post_id"
  end

  create_table "post_reply_receipts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "post_id", null: false
    t.uuid "friend_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.index ["friend_id"], name: "index_post_reply_receipts_on_friend_id"
    t.index ["post_id"], name: "index_post_reply_receipts_on_post_id"
  end

  create_table "post_stickers", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "post_id", null: false
    t.uuid "friend_id", null: false
    t.string "emoji", null: false
    t.float "relative_position_x", null: false
    t.float "relative_position_y", null: false
    t.datetime "created_at", precision: nil, null: false
    t.index ["emoji"], name: "index_post_stickers_on_emoji"
    t.index ["friend_id"], name: "index_post_stickers_on_friend_id"
    t.index ["post_id"], name: "index_post_stickers_on_post_id"
  end

  create_table "post_views", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "post_id", null: false
    t.uuid "friend_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.index ["friend_id", "post_id"], name: "index_post_views_uniqueness", unique: true
    t.index ["friend_id"], name: "index_post_views_on_friend_id"
    t.index ["post_id"], name: "index_post_views_on_post_id"
  end

  create_table "posts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "body_html", null: false
    t.uuid "author_id", null: false
    t.string "emoji"
    t.string "type", null: false
    t.string "title"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "visibility", null: false
    t.datetime "pinned_until", precision: nil
    t.uuid "quoted_post_id"
    t.uuid "hidden_from_ids", default: [], null: false, array: true
    t.uuid "images_ids", default: [], null: false, array: true
    t.index "(((to_tsvector('simple'::regconfig, COALESCE((emoji)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((title)::text, ''::text))) || to_tsvector('simple'::regconfig, COALESCE(body_html, ''::text))))", name: "index_posts_for_search", using: :gin
    t.index ["author_id"], name: "index_posts_on_author_id"
    t.index ["hidden_from_ids"], name: "index_posts_on_hidden_from_ids"
    t.index ["pinned_until"], name: "index_posts_on_pinned_until"
    t.index ["quoted_post_id"], name: "index_posts_on_quoted_post_id"
    t.index ["type"], name: "index_posts_on_type"
    t.index ["visibility"], name: "index_posts_on_visibility"
  end

  create_table "push_registrations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "owner_type"
    t.uuid "owner_id"
    t.uuid "push_subscription_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.uuid "device_id", null: false
    t.string "device_fingerprint", null: false
    t.datetime "updated_at", precision: nil, null: false
    t.float "device_fingerprint_confidence", limit: 24, null: false
    t.index ["device_fingerprint"], name: "index_push_registrations_on_device_fingerprint"
    t.index ["device_id"], name: "index_push_registrations_on_device_id"
    t.index ["owner_type", "owner_id", "push_subscription_id"], name: "index_push_registrations_uniqueness", unique: true
    t.index ["owner_type", "owner_id"], name: "index_push_registrations_on_owner"
    t.index ["push_subscription_id"], name: "index_push_registrations_on_push_subscription_id"
  end

  create_table "push_subscriptions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "auth_key", null: false
    t.string "endpoint", null: false
    t.string "p256dh_key", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["endpoint"], name: "index_push_subscriptions_on_endpoint", unique: true
  end

  create_table "sessions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.inet "ip_address", null: false
    t.string "user_agent", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "task_records", id: false, force: :cascade do |t|
    t.string "version", null: false
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "handle", null: false
    t.string "phone_number", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "notifications_last_cleared_at", precision: nil
    t.string "theme"
    t.string "time_zone_name", null: false
    t.boolean "hide_stats", null: false
    t.string "reply_to_number"
    t.string "api_token"
    t.boolean "hide_neko", null: false
    t.index ["api_token"], name: "index_users_on_api_token", unique: true
    t.index ["handle"], name: "index_users_on_handle", unique: true
    t.index ["notifications_last_cleared_at"], name: "index_users_on_notifications_last_cleared_at"
    t.index ["phone_number"], name: "index_users_on_phone_number", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "encouragements", "friends"
  add_foreign_key "friends", "join_requests"
  add_foreign_key "friends", "users"
  add_foreign_key "join_requests", "users"
  add_foreign_key "post_reactions", "friends"
  add_foreign_key "post_reactions", "posts"
  add_foreign_key "post_reply_receipts", "friends"
  add_foreign_key "post_reply_receipts", "posts"
  add_foreign_key "post_stickers", "friends"
  add_foreign_key "post_stickers", "posts"
  add_foreign_key "post_views", "friends"
  add_foreign_key "post_views", "posts"
  add_foreign_key "posts", "posts", column: "quoted_post_id"
  add_foreign_key "posts", "users", column: "author_id"
  add_foreign_key "push_registrations", "push_subscriptions"
  add_foreign_key "sessions", "users"
end
