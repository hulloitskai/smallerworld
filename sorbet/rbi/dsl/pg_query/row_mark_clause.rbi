# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::RowMarkClause`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::RowMarkClause`.


class PgQuery::RowMarkClause < Google::Protobuf::AbstractMessage
  sig do
    params(
      pushed_down: T.nilable(T::Boolean),
      rti: T.nilable(Integer),
      strength: T.nilable(T.any(Symbol, Integer)),
      wait_policy: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(pushed_down: nil, rti: nil, strength: nil, wait_policy: nil); end

  sig { void }
  def clear_pushed_down; end

  sig { void }
  def clear_rti; end

  sig { void }
  def clear_strength; end

  sig { void }
  def clear_wait_policy; end

  sig { returns(T::Boolean) }
  def pushed_down; end

  sig { params(value: T::Boolean).void }
  def pushed_down=(value); end

  sig { returns(Integer) }
  def rti; end

  sig { params(value: Integer).void }
  def rti=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def strength; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def strength=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def wait_policy; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def wait_policy=(value); end
end
