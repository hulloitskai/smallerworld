# typed: true
# frozen_string_literal: true

class UserWorldInvitationSerializer < InvitationSerializer
  # == Configuration ==

  object_as :invitation

  # == Attributes ==

  attributes :created_at
end
