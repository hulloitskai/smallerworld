# typed: strict
# frozen_string_literal: true

class ScheduleActivityCouponReminderJob < ApplicationJob
  extend T::Sig
  extend T::Helpers

  # == Configuration
  good_job_control_concurrency_with(key: name, total_limit: 1)

  # == Job
  sig { void }
  def perform
    # For each active coupon without recent notification
    ActivityCoupon.active.without_recent_notification.find_each do |coupon|
      user_timezone = coupon.user!.time_zone
      user_now = user_timezone.now
      user_8am = user_now.beginning_of_day + 8.hours

      # If 8am today has already passed, schedule for tomorrow
      user_8am += 1.day if user_now >= user_8am

      # Schedule individual job for next 8am in user's timezone
      SendActivityCouponReminderJob
        .set(wait_until: user_8am)
        .perform_later(coupon)
    end
  end
end
