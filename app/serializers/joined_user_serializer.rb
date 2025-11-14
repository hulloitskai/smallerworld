# typed: true
# frozen_string_literal: true

class JoinedUserSerializer < ApplicationSerializer
  # == Attributes ==

  identifier type: :string
  attributes name: { type: :string },
             handle: { type: :string },
             phone_number: { type: :string },
             friend_access_token: { type: :string },
             friended: { type: :boolean }
end
