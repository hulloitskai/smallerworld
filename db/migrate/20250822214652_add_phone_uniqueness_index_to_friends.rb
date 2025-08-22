# typed: true
# frozen_string_literal: true

class AddPhoneUniquenessIndexToFriends < ActiveRecord::Migration[8.0]
  def change
    rename_index :friends,
                 "index_friends_uniqueness",
                 "index_friends_name_uniqueness"
    rename_index :invitations,
                 "index_invitations_uniqueness",
                 "index_invitations_invitee_name_uniqueness"
    add_index :friends,
              %i[user_id phone_number],
              unique: true,
              name: "index_friends_phone_number_uniqueness"
  end
end
