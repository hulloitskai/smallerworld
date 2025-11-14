# typed: true
# frozen_string_literal: true

class AnnouncementSerializer < ApplicationSerializer
  # == Attributes ==

  identifier
  attributes :created_at, :message, :test_recipient_phone_number
end
