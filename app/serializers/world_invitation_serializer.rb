# typed: true
# frozen_string_literal: true

class WorldInvitationSerializer < InvitationSerializer
  # == Configuration ==

  object_as :invitation

  # == Attributes ==

  attributes :created_at
end
