# typed: true
# frozen_string_literal: true

class PostAlertNotificationPayloadPostAlertSerializer < ApplicationSerializer
  # == Configuration
  object_as :post_alert

  # == Attributes
  identifier
  attributes :message

  # == Associations
  has_one :post, serializer: PostAlertNotificationPayloadPostSerializer
end
