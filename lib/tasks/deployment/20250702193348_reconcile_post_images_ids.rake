# frozen_string_literal: true

namespace :after_party do
  desc "Deployment task: reconcile_post_images_ids"
  task reconcile_post_images_ids: :environment do
    puts "Running deploy task 'reconcile_post_images_ids'"

    # Put your task implementation HERE.
    fixed_posts = 0
    failed_post_ids = []
    Post.where("CARDINALITY(images_ids) = 0").find_each do |post|
      post.save_images_ids!
      fixed_posts += 1
    rescue => error
      puts "Failed to save image order for #{post.id}: #{error.message}"
      puts error.backtrace.join("\n")
      failed_post_ids << post.id
    end
    puts "Saved image order for #{fixed_posts} posts"
    puts "Failed to save image order for #{failed_post_ids.join(", ")}"

    # Update task as completed.  If you remove the line below, the task will
    # run with every deploy (or every time you call after_party:run).
    AfterParty::TaskRecord
      .create(version: AfterParty::TaskRecorder.new(__FILE__).timestamp)
  end
end
