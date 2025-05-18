# typed: true
# frozen_string_literal: true

module Features
  ALL_FEATURES = %i[encouragements]
  ACTIVE_SINCE = T.let(
    { encouragements: Time.new(2025, 4, 11, 16, 0, 0, "-05:00") },
    T::Hash[Symbol, Time],
  )
end
