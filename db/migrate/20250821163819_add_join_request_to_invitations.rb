# typed: true
# frozen_string_literal: true

class AddJoinRequestToInvitations < ActiveRecord::Migration[8.0]
  def change
    add_reference :invitations, :join_request, type: :uuid
  end
end
