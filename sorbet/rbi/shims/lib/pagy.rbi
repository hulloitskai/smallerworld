# typed: strong

module Pagy::KeysetExtra
  private

  sig do
    type_parameters(:U).
      params(set: ActiveRecord::Relation, vars: T.untyped).
      returns([Pagy::Keyset, T::Array[T.type_parameter(:U)]])
  end
  def pagy_keyset(set, **vars); end
end
