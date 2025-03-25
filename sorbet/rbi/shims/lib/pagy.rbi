# typed: strong

module Pagy::KeysetExtra
  private

  sig do
    params(set: ActiveRecord::Relation, vars: T.untyped).
      returns([Pagy::Keyset, T::Array[T.untyped]])
  end
  def pagy_keyset(set, **vars); end
end
