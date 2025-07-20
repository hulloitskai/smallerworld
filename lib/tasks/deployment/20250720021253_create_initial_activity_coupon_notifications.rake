# frozen_string_literal: true

namespace :after_party do
  desc "Deployment task: create_initial_activity_coupon_notifications"
  task create_initial_activity_coupon_notifications: :environment do
    puts "Running deploy task 'create_initial_activity_coupon_notifications'"

    # Put your task implementation HERE.
    notifications_sent = 0
    ActivityCoupon.active
      .where.missing(:notifications)
      .find_each do |activity_coupon|
        activity_coupon.create_notification!
        notifications_sent += 1
      end
    puts "Sent #{notifications_sent} notifications"

    # Update task as completed.  If you remove the line below, the task will
    # run with every deploy (or every time you call after_party:run).
    AfterParty::TaskRecord
      .create(version: AfterParty::TaskRecorder.new(__FILE__).timestamp)
  end
end
