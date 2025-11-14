# typed: false
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: users
#
#  id                            :uuid             not null, primary key
#  allow_friend_sharing          :boolean          not null
#  handle                        :string           not null
#  hide_neko                     :boolean          not null
#  hide_stats                    :boolean          not null
#  membership_tier               :string
#  name                          :string           not null
#  notifications_last_cleared_at :datetime
#  phone_number                  :string           not null
#  reply_to_number               :string
#  theme                         :string
#  time_zone_name                :string           not null
#  created_at                    :datetime         not null
#  updated_at                    :datetime         not null
#
# Indexes
#
#  index_users_on_handle                         (handle) UNIQUE
#  index_users_on_membership_tier                (membership_tier)
#  index_users_on_notifications_last_cleared_at  (notifications_last_cleared_at)
#  index_users_on_phone_number                   (phone_number) UNIQUE
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
require "test_helper"

class UserTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::TimeHelpers

  setup do
    @user = T.let(users(:noposts), User)
    @usertz = T.let(@user.time_zone, ActiveSupport::TimeZone)
  end

  test "post_streak returns nil when no posts exist" do
    travel_to @usertz.local(2024, 5, 5, 12) do
      streak = @user.post_streak
      assert_nil streak
    end
  end

  test "post_streak counts consecutive days including today" do
    travel_to @usertz.local(2024, 5, 5, 16) do
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>hello today</p>",
        visibility: :public,
        created_at: @usertz.local(2024, 5, 5, 9, 15),
      )
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>another today</p>",
        visibility: :public,
        created_at: @usertz.local(2024, 5, 5, 10, 30),
      )
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>yesterday</p>",
        visibility: :public,
        created_at: @usertz.local(2024, 5, 4, 20, 30),
      )

      streak = @user.post_streak
      assert_equal 2, streak.length
      assert streak.posted_today
    end
  end

  test "post_streak counts consecutive days when today is missing" do
    travel_to @usertz.local(2024, 5, 5, 16) do
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>yesterday</p>",
        visibility: :public,
        created_at: @usertz.local(2024, 5, 4, 9, 0),
      )
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>two days ago</p>",
        visibility: :public,
        created_at: @usertz.local(2024, 5, 3, 9, 0),
      )

      streak = @user.post_streak
      assert_equal 2, streak.length
      assert_not streak.posted_today
    end
  end

  test "post_streak stops counting when a day is skipped" do
    travel_to @usertz.local(2024, 5, 5, 16) do
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>today</p>",
        visibility: :public,
        created_at: @usertz.local(2024, 5, 5, 9, 0),
      )
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>two days ago</p>",
        visibility: :public,
        created_at: @usertz.local(2024, 5, 3, 9, 0),
      )

      streak = @user.post_streak
      assert_equal 1, streak.length
      assert streak.posted_today
    end
  end

  test "post_streak respects the provided timezone" do
    travel_to @usertz.local(2024, 5, 5, 10) do
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>late night</p>",
        visibility: :public,
        created_at: @usertz.local(2024, 5, 4, 23, 30),
      )

      streak = @user.post_streak
      assert_equal 1, streak.length
      assert_not streak.posted_today

      singapore = ActiveSupport::TimeZone["Asia/Singapore"]
      streak = @user.post_streak(time_zone: singapore)
      assert_equal 1, streak.length
      assert streak.posted_today
    end
  end
end
