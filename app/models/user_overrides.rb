# typed: true
# frozen_string_literal: true

class UserOverrides < T::Struct
  const :feature_flags, T::Set[Symbol]
  const :membership_tier, T.nilable(Enumerize::Value)
end
