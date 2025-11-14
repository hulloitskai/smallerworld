# typed: true
# frozen_string_literal: true

class InvitationSerializer < ApplicationSerializer
  # == Attributes ==

  identifier
  attributes :invitee_name,
             :invitee_emoji,
             offered_activity_ids: { type: "string[]" }
end
