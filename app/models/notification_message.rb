# typed: true
# frozen_string_literal: true

class NotificationMessage < T::Struct
  extend T::Sig

  # == Properties ==

  const :title, String
  const :body, T.nilable(String)
  const :image, T.nilable(Image)
  const :target_url, T.nilable(String)
end
