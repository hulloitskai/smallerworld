# typed: true
# frozen_string_literal: true

class NotificationMessageSerializer < ApplicationSerializer
  # == Configuration
  object_as :message, model: "NotificationMessage"

  # == Attributes
  attributes title: { type: :string },
             body: { type: :string, nullable: true },
             target_url: { type: :string, nullable: true }

  attribute :image_url, type: :string, nullable: true do
    if (image = message.image)
      rails_representation_url(image, resize_to_limit: [
        Image::NOTIFICATION_SIZE,
        Image::NOTIFICATION_SIZE,
      ])
    end
  end
end
