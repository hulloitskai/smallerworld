# frozen_string_literal: true

namespace :after_party do
  desc "Deployment task: resend_follow_up_notifications"
  task resend_follow_up_notifications: :environment do
    puts "Running deploy task 'resend_follow_up_notifications'"

    # Put your task implementation HERE.
    Post.where(type: "follow_up").find_each(&:create_notifications!)

    # Update task as completed.  If you remove the line below, the task will
    # run with every deploy (or every time you call after_party:run).
    AfterParty::TaskRecord
      .create(version: AfterParty::TaskRecorder.new(__FILE__).timestamp)
  end
end
