# typed: true
# frozen_string_literal: true

class FriendNotificationSettingsSerializer < ApplicationSerializer
  # == Configuration ==

  object_as :friend

  # == Attributes ==

  attributes subscribed_post_types: { type: "PostType[]" }
end
