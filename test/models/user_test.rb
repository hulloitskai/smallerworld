# typed: false
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: users
#
#  id                            :uuid             not null, primary key
#  allow_friend_sharing          :boolean          not null
#  api_token                     :string
#  handle                        :string           not null
#  hide_neko                     :boolean          not null
#  hide_stats                    :boolean          not null
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
#  index_users_on_api_token                      (api_token) UNIQUE
#  index_users_on_handle                         (handle) UNIQUE
#  index_users_on_notifications_last_cleared_at  (notifications_last_cleared_at)
#  index_users_on_phone_number                   (phone_number) UNIQUE
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
require "test_helper"

class UserTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::TimeHelpers

  setup do
    @user = users(:testy)
    @user.posts.delete_all
  end

  test "post_streak returns zero when no posts exist" do
    travel_to Time.utc(2024, 5, 5, 12) do
      streak, posted_today = @user.post_streak

      assert_equal 0, streak
      assert_not posted_today
    end
  end

  test "post_streak counts consecutive days including today" do
    travel_to Time.utc(2024, 5, 5, 16) do
      tz = @user.time_zone
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>hello today</p>",
        visibility: :public,
        created_at: tz.local(2024, 5, 5, 9, 15),
      )
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>another today</p>",
        visibility: :public,
        created_at: tz.local(2024, 5, 5, 10, 30),
      )
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>yesterday</p>",
        visibility: :public,
        created_at: tz.local(2024, 5, 4, 20, 30),
      )

      streak, posted_today = @user.post_streak

      assert_equal 2, streak
      assert posted_today
    end
  end

  test "post_streak counts consecutive days when today is missing" do
    travel_to Time.utc(2024, 5, 5, 16) do
      tz = @user.time_zone
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>yesterday</p>",
        visibility: :public,
        created_at: tz.local(2024, 5, 4, 9, 0),
      )
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>two days ago</p>",
        visibility: :public,
        created_at: tz.local(2024, 5, 3, 9, 0),
      )

      streak, posted_today = @user.post_streak

      assert_equal 2, streak
      assert_not posted_today
    end
  end

  test "post_streak stops counting when a day is skipped" do
    travel_to Time.utc(2024, 5, 5, 16) do
      tz = @user.time_zone
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>today</p>",
        visibility: :public,
        created_at: tz.local(2024, 5, 5, 9, 0),
      )
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>two days ago</p>",
        visibility: :public,
        created_at: tz.local(2024, 5, 3, 9, 0),
      )

      streak, posted_today = @user.post_streak

      assert_equal 1, streak
      assert posted_today
    end
  end

  test "post_streak respects the provided timezone" do
    travel_to Time.utc(2024, 5, 5, 10) do
      @user.posts.create!(
        type: "journal_entry",
        body_html: "<p>late night</p>",
        visibility: :public,
        created_at: Time.utc(2024, 5, 4, 23, 30),
      )

      streak, posted_today = @user.post_streak

      assert_equal 1, streak
      assert_not posted_today

      auckland = ActiveSupport::TimeZone["Pacific/Auckland"]
      streak, posted_today = @user.post_streak(time_zone: auckland)

      assert_equal 1, streak
      assert posted_today
    end
  end
end
