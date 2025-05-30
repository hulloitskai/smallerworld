# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::FieldStore`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::FieldStore`.


class PgQuery::FieldStore < Google::Protobuf::AbstractMessage
  sig do
    params(
      arg: T.nilable(PgQuery::Node),
      fieldnums: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      newvals: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      resulttype: T.nilable(Integer),
      xpr: T.nilable(PgQuery::Node)
    ).void
  end
  def initialize(arg: nil, fieldnums: T.unsafe(nil), newvals: T.unsafe(nil), resulttype: nil, xpr: nil); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def arg; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def arg=(value); end

  sig { void }
  def clear_arg; end

  sig { void }
  def clear_fieldnums; end

  sig { void }
  def clear_newvals; end

  sig { void }
  def clear_resulttype; end

  sig { void }
  def clear_xpr; end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def fieldnums; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def fieldnums=(value); end

  sig { returns(Object) }
  def has_arg?; end

  sig { returns(Object) }
  def has_xpr?; end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def newvals; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def newvals=(value); end

  sig { returns(Integer) }
  def resulttype; end

  sig { params(value: Integer).void }
  def resulttype=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def xpr; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def xpr=(value); end
end
