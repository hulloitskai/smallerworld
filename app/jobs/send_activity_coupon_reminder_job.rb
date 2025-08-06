# typed: strict
# frozen_string_literal: true

class SendActivityCouponReminderJob < ApplicationJob
  extend T::Sig
  extend T::Helpers

  # == Configuration
  good_job_control_concurrency_with(
    key: -> {
      T.bind(self, SendActivityCouponReminderJob)
      coupon, = arguments
      "#{self.class.name}(#{coupon.to_gid})"
    },
    total_limit: 1,
  )

  # == Job
  sig { params(coupon: ActivityCoupon).void }
  def perform(coupon)
    if (recent_notification = coupon.recent_notification)
      logger.warn(
        "Activity coupon #{coupon.id} has a recent notification " \
          "(#{recent_notification.created_at}), skipping...",
      )
    else
      coupon.create_notification!
    end
  end
end
