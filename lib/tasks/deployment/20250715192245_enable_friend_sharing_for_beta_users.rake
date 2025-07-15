# rubocop:disable Rails/SkipsModelValidations
# frozen_string_literal: true

namespace :after_party do
  PRODUCTION_HANDLES = %w[antopunfu marsha gitanjali itskai adameow]
  DEVELOPMENT_HANDLES = %w[itskai]

  desc "Deployment task: enable_friend_sharing_for_beta_users"
  task enable_friend_sharing_for_beta_users: :environment do
    puts "Running deploy task 'enable_friend_sharing_for_beta_users'"

    # Put your task implementation HERE.
    if Rails.env.production?
      User
        .where(handle: PRODUCTION_HANDLES)
        .update_all(allow_friend_sharing: true)
    elsif Rails.env.development?
      User
        .where(handle: DEVELOPMENT_HANDLES)
        .update_all(allow_friend_sharing: true)
    end

    # Update task as completed.  If you remove the line below, the task will
    # run with every deploy (or every time you call after_party:run).
    AfterParty::TaskRecord
      .create(version: AfterParty::TaskRecorder.new(__FILE__).timestamp)
  end
end
