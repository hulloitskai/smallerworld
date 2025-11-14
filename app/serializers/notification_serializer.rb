# typed: true
# frozen_string_literal: true

class NotificationSerializer < ApplicationSerializer
  # == Configuration ==

  object_as :notification

  # == Attributes ==

  identifier
  attributes created_at: { as: :timestamp },
             delivery_token: { type: :string, nullable: true }

  # == Associations ==

  flat_one :message, serializer: NotificationMessageSerializer
end
