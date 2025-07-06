# typed: true
# frozen_string_literal: true

class AddServiceWorkerVersionToPushRegistrations < ActiveRecord::Migration[8.0]
  def change
    add_column :push_registrations, :service_worker_version, :integer
  end
end
