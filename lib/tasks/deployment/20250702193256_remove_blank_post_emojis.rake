# frozen_string_literal: true

namespace :after_party do
  desc "Deployment task: remove_blank_post_emojis"
  task remove_blank_post_emojis: :environment do
    puts "Running deploy task 'remove_blank_post_emojis'"

    # Put your task implementation HERE.
    Post.where(emoji: "").update_all(emoji: nil) # rubocop:disable Rails/SkipsModelValidations

    # Update task as completed.  If you remove the line below, the task will
    # run with every deploy (or every time you call after_party:run).
    AfterParty::TaskRecord
      .create(version: AfterParty::TaskRecorder.new(__FILE__).timestamp)
  end
end
