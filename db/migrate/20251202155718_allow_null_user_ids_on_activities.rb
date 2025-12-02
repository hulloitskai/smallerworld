# typed: true
# frozen_string_literal: true

class AllowNullUserIdsOnActivities < ActiveRecord::Migration[8.0]
  def change
    change_column_null :activities, :deprecated_user_id, true
  end
end
