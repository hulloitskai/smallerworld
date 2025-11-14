# typed: true
# frozen_string_literal: true

module SharesApplicationProps
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  # == Constants ==

  SHARED_FAVICON_LINKS = [
    {
      "head-key" => "favicon",
      "rel" => "shortcut icon",
      "href" => "/favicon.ico",
    },
    {
      "head-key" => "favicon-image",
      "rel" => "icon",
      "type" => "image/png",
      "href" => "/favicon-96x96.png",
      "sizes" => "96x96",
    },
    {
      "head-key" => "apple-touch-icon",
      "rel" => "apple-touch-icon",
      "href" => "/apple-touch-icon.png",
    },
  ]

  # == Annotations ==

  requires_ancestor { ApplicationController }

  included do
    T.bind(self, T.class_of(ApplicationController))

    inertia_share do
      {
        csrf: {
          param: request_forgery_protection_token,
          token: form_authenticity_token,
        },
        flash: flash.to_h,
        "currentUser" => UserSerializer.one_if(current_user),
        "currentFriend" => FriendSerializer.one_if(current_friend),
        "faviconLinks" => SHARED_FAVICON_LINKS,
        "isAdmin" => current_user&.admin?,
      }
    end
  end
end
