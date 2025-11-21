# typed: false
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: worlds
#
#  id                       :uuid             not null, primary key
#  allow_friend_sharing     :boolean          not null
#  handle                   :string           not null
#  hide_neko                :boolean          not null
#  hide_stats               :boolean          not null
#  reply_to_number_override :string
#  theme                    :string
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  owner_id                 :uuid             not null
#
# Indexes
#
#  index_worlds_on_handle    (handle) UNIQUE
#  index_worlds_on_owner_id  (owner_id)
#
# Foreign Keys
#
#  fk_rails_...  (owner_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
require "test_helper"

class WorldTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::TimeHelpers

  setup do
    @world = T.let(worlds(:noposts_world), World)
    @owner = T.let(@world.owner!, User)
    @worldtz = T.let(@owner.time_zone, ActiveSupport::TimeZone)
  end

  test "world post_streak returns nil when no posts exist" do
    travel_to @worldtz.local(2024, 5, 5, 12) do
      streak = @world.post_streak
      assert_nil streak
    end
  end

  test "world post_streak counts consecutive days including today" do
    travel_to @worldtz.local(2024, 5, 5, 16) do
      @world.posts.create!(
        author: @owner,
        type: "journal_entry",
        body_html: "<p>hello today</p>",
        visibility: :public,
        created_at: @worldtz.local(2024, 5, 5, 9, 15),
      )
      @world.posts.create!(
        author: @owner,
        type: "journal_entry",
        body_html: "<p>another today</p>",
        visibility: :public,
        created_at: @worldtz.local(2024, 5, 5, 10, 30),
      )
      @world.posts.create!(
        author: @owner,
        type: "journal_entry",
        body_html: "<p>yesterday</p>",
        visibility: :public,
        created_at: @worldtz.local(2024, 5, 4, 20, 30),
      )

      streak = @world.post_streak
      assert_equal 2, streak.length
      assert streak.posted_today
    end
  end

  test "world post_streak counts consecutive days when today is missing" do
    travel_to @worldtz.local(2024, 5, 5, 16) do
      @world.posts.create!(
        author: @owner,
        type: "journal_entry",
        body_html: "<p>yesterday</p>",
        visibility: :public,
        created_at: @worldtz.local(2024, 5, 4, 9, 0),
      )
      @world.posts.create!(
        author: @owner,
        type: "journal_entry",
        body_html: "<p>two days ago</p>",
        visibility: :public,
        created_at: @worldtz.local(2024, 5, 3, 9, 0),
      )

      streak = @world.post_streak
      assert_equal 2, streak.length
      assert_not streak.posted_today
    end
  end

  test "world post_streak stops counting when a day is skipped" do
    travel_to @worldtz.local(2024, 5, 5, 16) do
      @world.posts.create!(
        author: @owner,
        type: "journal_entry",
        body_html: "<p>today</p>",
        visibility: :public,
        created_at: @worldtz.local(2024, 5, 5, 9, 0),
      )
      @world.posts.create!(
        author: @owner,
        type: "journal_entry",
        body_html: "<p>two days ago</p>",
        visibility: :public,
        created_at: @worldtz.local(2024, 5, 3, 9, 0),
      )

      streak = @world.post_streak
      assert_equal 1, streak.length
      assert streak.posted_today
    end
  end

  test "world post_streak respects the provided timezone" do
    travel_to @worldtz.local(2024, 5, 5, 10) do
      @world.posts.create!(
        author: @owner,
        type: "journal_entry",
        body_html: "<p>late night</p>",
        visibility: :public,
        created_at: @worldtz.local(2024, 5, 4, 23, 30),
      )

      streak = @world.post_streak
      assert_equal 1, streak.length
      assert_not streak.posted_today

      singapore = ActiveSupport::TimeZone["Asia/Singapore"]
      streak = @world.post_streak(time_zone: singapore)
      assert_equal 1, streak.length
      assert streak.posted_today
    end
  end
end
