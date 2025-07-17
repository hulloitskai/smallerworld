# typed: true
# frozen_string_literal: true

class ActivityCouponSerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :expires_at

  # == Associations
  has_one :activity, serializer: ActivitySerializer
end
