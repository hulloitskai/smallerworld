# frozen_string_literal: true

namespace :after_party do
  desc "Deployment task: remove_variant_records"
  task remove_variant_records: :environment do
    puts "Running deploy task 'remove_variant_records'"

    # Put your task implementation HERE.
    result = ActiveStorage::VariantRecord.destroy_all
    puts "Destroyed #{result.count} variant records"

    # Update task as completed.  If you remove the line below, the task will
    # run with every deploy (or every time you call after_party:run).
    AfterParty::TaskRecord
      .create(version: AfterParty::TaskRecorder.new(__FILE__).timestamp)
  end
end
