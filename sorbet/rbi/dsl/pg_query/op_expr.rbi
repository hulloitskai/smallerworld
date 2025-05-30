# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::OpExpr`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::OpExpr`.


class PgQuery::OpExpr < Google::Protobuf::AbstractMessage
  sig do
    params(
      args: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      inputcollid: T.nilable(Integer),
      location: T.nilable(Integer),
      opcollid: T.nilable(Integer),
      opno: T.nilable(Integer),
      opresulttype: T.nilable(Integer),
      opretset: T.nilable(T::Boolean),
      xpr: T.nilable(PgQuery::Node)
    ).void
  end
  def initialize(args: T.unsafe(nil), inputcollid: nil, location: nil, opcollid: nil, opno: nil, opresulttype: nil, opretset: nil, xpr: nil); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def args; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def args=(value); end

  sig { void }
  def clear_args; end

  sig { void }
  def clear_inputcollid; end

  sig { void }
  def clear_location; end

  sig { void }
  def clear_opcollid; end

  sig { void }
  def clear_opno; end

  sig { void }
  def clear_opresulttype; end

  sig { void }
  def clear_opretset; end

  sig { void }
  def clear_xpr; end

  sig { returns(Object) }
  def has_xpr?; end

  sig { returns(Integer) }
  def inputcollid; end

  sig { params(value: Integer).void }
  def inputcollid=(value); end

  sig { returns(Integer) }
  def location; end

  sig { params(value: Integer).void }
  def location=(value); end

  sig { returns(Integer) }
  def opcollid; end

  sig { params(value: Integer).void }
  def opcollid=(value); end

  sig { returns(Integer) }
  def opno; end

  sig { params(value: Integer).void }
  def opno=(value); end

  sig { returns(Integer) }
  def opresulttype; end

  sig { params(value: Integer).void }
  def opresulttype=(value); end

  sig { returns(T::Boolean) }
  def opretset; end

  sig { params(value: T::Boolean).void }
  def opretset=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def xpr; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def xpr=(value); end
end
