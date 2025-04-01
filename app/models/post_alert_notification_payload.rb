# typed: true
# frozen_string_literal: true

class PostAlertNotificationPayload < T::Struct
  # == Properties
  const :post_alert, PostAlert
  const :friend_access_token, T.nilable(String)
end
