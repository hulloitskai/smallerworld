# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::PartitionCmd`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::PartitionCmd`.


class PgQuery::PartitionCmd < Google::Protobuf::AbstractMessage
  sig do
    params(
      bound: T.nilable(PgQuery::PartitionBoundSpec),
      concurrent: T.nilable(T::Boolean),
      name: T.nilable(PgQuery::RangeVar)
    ).void
  end
  def initialize(bound: nil, concurrent: nil, name: nil); end

  sig { returns(T.nilable(PgQuery::PartitionBoundSpec)) }
  def bound; end

  sig { params(value: T.nilable(PgQuery::PartitionBoundSpec)).void }
  def bound=(value); end

  sig { void }
  def clear_bound; end

  sig { void }
  def clear_concurrent; end

  sig { void }
  def clear_name; end

  sig { returns(T::Boolean) }
  def concurrent; end

  sig { params(value: T::Boolean).void }
  def concurrent=(value); end

  sig { returns(Object) }
  def has_bound?; end

  sig { returns(Object) }
  def has_name?; end

  sig { returns(T.nilable(PgQuery::RangeVar)) }
  def name; end

  sig { params(value: T.nilable(PgQuery::RangeVar)).void }
  def name=(value); end
end
