# rubocop:disable Layout/LineLength
# frozen_string_literal: true

namespace :after_party do
  desc "Deployment task: resend_undelivered_notifications_since_2025_05_01"
  task resend_undelivered_notifications_since_2025_05_01: :environment do
    puts "Running deploy task 'resend_undelivered_notifications_since_2025_05_01'"

    # Put your task implementation HERE.
    Notification
      .undelivered
      .where(created_at: Time.new(2025, 5, 1)..) # rubocop:disable Rails/TimeZone
      .find_each do |notification|
        puts "Resending notification #{notification.id}"
        notification.push
      end

    # Update task as completed.  If you remove the line below, the task will
    # run with every deploy (or every time you call after_party:run).
    AfterParty::TaskRecord
      .create(version: AfterParty::TaskRecorder.new(__FILE__).timestamp)
  end
end
