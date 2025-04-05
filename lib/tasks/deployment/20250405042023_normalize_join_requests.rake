# frozen_string_literal: true

namespace :after_party do
  desc "Deployment task: normalize_join_requests"
  task normalize_join_requests: :environment do
    puts "Running deploy task 'normalize_join_requests'"

    # Put your task implementation HERE.
    JoinRequest.find_each do |join_request|
      join_request.normalize_attribute(:name)
      join_request.normalize_attribute(:phone_number)
      join_request.save!
      puts "Normalized join request #{join_request.id}"
    end

    # Update task as completed.  If you remove the line below, the task will
    # run with every deploy (or every time you call after_party:run).
    AfterParty::TaskRecord
      .create(version: AfterParty::TaskRecorder.new(__FILE__).timestamp)
  end
end
