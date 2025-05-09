# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::JsonObjectConstructor`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::JsonObjectConstructor`.


class PgQuery::JsonObjectConstructor < Google::Protobuf::AbstractMessage
  sig do
    params(
      absent_on_null: T.nilable(T::Boolean),
      exprs: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      location: T.nilable(Integer),
      output: T.nilable(PgQuery::JsonOutput),
      unique: T.nilable(T::Boolean)
    ).void
  end
  def initialize(absent_on_null: nil, exprs: T.unsafe(nil), location: nil, output: nil, unique: nil); end

  sig { returns(T::Boolean) }
  def absent_on_null; end

  sig { params(value: T::Boolean).void }
  def absent_on_null=(value); end

  sig { void }
  def clear_absent_on_null; end

  sig { void }
  def clear_exprs; end

  sig { void }
  def clear_location; end

  sig { void }
  def clear_output; end

  sig { void }
  def clear_unique; end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def exprs; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def exprs=(value); end

  sig { returns(Object) }
  def has_output?; end

  sig { returns(Integer) }
  def location; end

  sig { params(value: Integer).void }
  def location=(value); end

  sig { returns(T.nilable(PgQuery::JsonOutput)) }
  def output; end

  sig { params(value: T.nilable(PgQuery::JsonOutput)).void }
  def output=(value); end

  sig { returns(T::Boolean) }
  def unique; end

  sig { params(value: T::Boolean).void }
  def unique=(value); end
end
