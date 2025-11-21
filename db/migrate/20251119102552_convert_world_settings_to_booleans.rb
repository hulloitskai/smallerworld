# typed: true
# frozen_string_literal: true

class ConvertWorldSettingsToBooleans < ActiveRecord::Migration[8.0]
  SETTINGS = %i[
    allow_friend_sharing
    hide_neko
    hide_stats
  ].freeze

  def up
    SETTINGS.each do |column|
      change_column :worlds,
                    column,
                    :boolean,
                    null: false,
                    using: "#{column}::boolean"
    end
  end

  def down
    SETTINGS.each do |column|
      change_column :worlds,
                    column,
                    :string,
                    null: false,
                    using: "CASE WHEN #{column} THEN 't' ELSE 'f' END"
    end
  end
end
