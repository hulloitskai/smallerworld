# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::SubLink`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::SubLink`.


class PgQuery::SubLink < Google::Protobuf::AbstractMessage
  sig do
    params(
      location: T.nilable(Integer),
      oper_name: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      sub_link_id: T.nilable(Integer),
      sub_link_type: T.nilable(T.any(Symbol, Integer)),
      subselect: T.nilable(PgQuery::Node),
      testexpr: T.nilable(PgQuery::Node),
      xpr: T.nilable(PgQuery::Node)
    ).void
  end
  def initialize(location: nil, oper_name: T.unsafe(nil), sub_link_id: nil, sub_link_type: nil, subselect: nil, testexpr: nil, xpr: nil); end

  sig { void }
  def clear_location; end

  sig { void }
  def clear_oper_name; end

  sig { void }
  def clear_sub_link_id; end

  sig { void }
  def clear_sub_link_type; end

  sig { void }
  def clear_subselect; end

  sig { void }
  def clear_testexpr; end

  sig { void }
  def clear_xpr; end

  sig { returns(Object) }
  def has_subselect?; end

  sig { returns(Object) }
  def has_testexpr?; end

  sig { returns(Object) }
  def has_xpr?; end

  sig { returns(Integer) }
  def location; end

  sig { params(value: Integer).void }
  def location=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def oper_name; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def oper_name=(value); end

  sig { returns(Integer) }
  def sub_link_id; end

  sig { params(value: Integer).void }
  def sub_link_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def sub_link_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def sub_link_type=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def subselect; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def subselect=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def testexpr; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def testexpr=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def xpr; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def xpr=(value); end
end
