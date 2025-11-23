# frozen_string_literal: true

namespace :after_party do
  desc "Deployment task: resend_failed_join_request_notifications"
  task resend_failed_join_request_notifications: :environment do
    puts "Running deploy task 'resend_failed_join_request_notifications'"

    # Put your task implementation HERE.
    Notification
      .where(noticeable_type: "JoinRequest", pushed_at: nil)
      .where("created_at > ?", 2.days.ago)
      .find_each do |notification|
        puts "== Resending notification #{notification.id}"
        notification.push
        puts
      end

    # Update task as completed.  If you remove the line below, the task will
    # run with every deploy (or every time you call after_party:run).
    AfterParty::TaskRecord
      .create(version: AfterParty::TaskRecorder.new(__FILE__).timestamp)
  end
end
