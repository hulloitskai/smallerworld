# typed: true
# frozen_string_literal: true

Rails.application.configure do
  config.good_job.tap do |config|
    config.smaller_number_is_higher_priority = true
    config.max_threads = ENV.fetch("GOOD_JOB_MAX_THREADS", 2).to_i

    # == Cron Jobs
    config.enable_cron = true
    config.cron = {
      "active_storage/cleanup_blobs": {
        class: "ActiveStorage::CleanupBlobsJob",
        description: "Schedule purging of unattached ActiveStorage blobs.",
        cron: "0 */6 * * *", # Every 6 hours
      },
      "activity_coupon_reminders": {
        class: "ScheduleActivityCouponReminderJob",
        description: "Schedule activity coupon reminders.",
        cron: "0 0 * * *", # Daily at midnight GMT
      },
    }

    # == Errors
    config.retry_on_unhandled_error = false
    config.on_thread_error = ->(error) do
      error = T.let(error, Exception)
      Rails.logger.error("Good Job thread error: #{error}")
      Rails.error.report(error, handled: false)
      Sentry.capture_exception(error)
    end
  end
end

ActiveSupport.on_load(:good_job_application_controller) do
  include AdminsOnly unless Rails.env.development?
end
