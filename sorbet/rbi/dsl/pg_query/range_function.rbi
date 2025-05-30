# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::RangeFunction`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::RangeFunction`.


class PgQuery::RangeFunction < Google::Protobuf::AbstractMessage
  sig do
    params(
      alias: T.nilable(PgQuery::Alias),
      coldeflist: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      functions: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      is_rowsfrom: T.nilable(T::Boolean),
      lateral: T.nilable(T::Boolean),
      ordinality: T.nilable(T::Boolean)
    ).void
  end
  def initialize(alias: nil, coldeflist: T.unsafe(nil), functions: T.unsafe(nil), is_rowsfrom: nil, lateral: nil, ordinality: nil); end

  sig { returns(T.nilable(PgQuery::Alias)) }
  def alias; end

  sig { params(value: T.nilable(PgQuery::Alias)).void }
  def alias=(value); end

  sig { void }
  def clear_alias; end

  sig { void }
  def clear_coldeflist; end

  sig { void }
  def clear_functions; end

  sig { void }
  def clear_is_rowsfrom; end

  sig { void }
  def clear_lateral; end

  sig { void }
  def clear_ordinality; end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def coldeflist; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def coldeflist=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def functions; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def functions=(value); end

  sig { returns(Object) }
  def has_alias?; end

  sig { returns(T::Boolean) }
  def is_rowsfrom; end

  sig { params(value: T::Boolean).void }
  def is_rowsfrom=(value); end

  sig { returns(T::Boolean) }
  def lateral; end

  sig { params(value: T::Boolean).void }
  def lateral=(value); end

  sig { returns(T::Boolean) }
  def ordinality; end

  sig { params(value: T::Boolean).void }
  def ordinality=(value); end
end
