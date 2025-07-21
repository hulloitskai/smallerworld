# typed: true
# frozen_string_literal: true

class AddServiceWorkerVersionToPushSubscriptions < ActiveRecord::Migration[8.0]
  def change
    add_column :push_subscriptions,
               :service_worker_version,
               :integer
    rename_column :push_registrations,
                  :service_worker_version,
                  :deprecated_service_worker_version

    up_only do
      execute <<-SQL.squish
        UPDATE push_subscriptions
        SET service_worker_version = subquery.max_version
        FROM (
          SELECT
            push_subscription_id,
            MAX(deprecated_service_worker_version) AS max_version
          FROM push_registrations
          GROUP BY push_subscription_id
        ) AS subquery
        WHERE push_subscriptions.id = subquery.push_subscription_id;
      SQL
    end
  end
end
