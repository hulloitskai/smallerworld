# typed: true
# frozen_string_literal: true

class RenamePhoneVerificationRequestsToLoginRequests < ActiveRecord::Migration[8.0] # rubocop:disable Layout/LineLength
  def change
    rename_table :phone_verification_requests, :login_requests
    change_table :login_requests do |t|
      t.rename :verification_code, :login_code
      t.rename :verified_at, :completed_at
    end
  end
end
