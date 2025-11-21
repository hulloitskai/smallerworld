# frozen_string_literal: true

namespace :after_party do
  desc "Deployment task: fix_pinned_until_timings"
  task fix_pinned_until_timings: :environment do
    puts "Running deploy task 'fix_pinned_until_timings'"

    # Put your task implementation HERE.
    Post.where.not(pinned_until: nil).includes(:author).find_each do |post|
      author = post.author!
      post.update(
        pinned_until: post.pinned_until
          .in_time_zone(author.time_zone)
          .change(
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 0,
          ),
      ) or next
      puts "Fixed pinned-until timing for post #{post.id}"
    end

    # Update task as completed.  If you remove the line below, the task will
    # run with every deploy (or every time you call after_party:run).
    AfterParty::TaskRecord
      .create(version: AfterParty::TaskRecorder.new(__FILE__).timestamp)
  end
end
