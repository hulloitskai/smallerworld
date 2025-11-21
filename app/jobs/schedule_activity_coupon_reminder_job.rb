# typed: strict
# frozen_string_literal: true

class ScheduleActivityCouponReminderJob < ApplicationJob
  extend T::Sig
  extend T::Helpers

  # == Configuration ==

  good_job_control_concurrency_with(key: name, total_limit: 1)

  # == Job ==

  sig { void }
  def perform
    # For each active coupon without recent notification
    ActivityCoupon.active.without_recent_notification.find_each do |coupon|
      friend_timezone = coupon.friend!.time_zone
      friend_now = friend_timezone.now
      friend_8am = friend_now.beginning_of_day + 8.hours

      # If 8am today has already passed, schedule for tomorrow
      friend_8am += 1.day if friend_now >= friend_8am

      # Schedule individual job for next 8am in friend's timezone
      SendActivityCouponReminderJob
        .set(wait_until: friend_8am)
        .perform_later(coupon)
    end
  end
end
