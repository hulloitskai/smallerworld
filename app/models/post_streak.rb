# typed: true
# frozen_string_literal: true

class PostStreak < T::Struct
  const :length, Integer
  const :posted_today, T::Boolean
end
