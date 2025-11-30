# typed: true
# frozen_string_literal: true

class UserSerializer < UserProfileSerializer
  # == Attributes ==

  attributes :created_at,
             :phone_number,
             :allow_space_replies,
             membership_tier: { type: '"supporter" | "believer"' }
end
