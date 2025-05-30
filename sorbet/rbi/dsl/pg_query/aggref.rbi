# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::Aggref`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::Aggref`.


class PgQuery::Aggref < Google::Protobuf::AbstractMessage
  sig do
    params(
      aggargtypes: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      aggcollid: T.nilable(Integer),
      aggdirectargs: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      aggdistinct: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      aggfilter: T.nilable(PgQuery::Node),
      aggfnoid: T.nilable(Integer),
      aggkind: T.nilable(String),
      agglevelsup: T.nilable(Integer),
      aggno: T.nilable(Integer),
      aggorder: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      aggsplit: T.nilable(T.any(Symbol, Integer)),
      aggstar: T.nilable(T::Boolean),
      aggtransno: T.nilable(Integer),
      aggtype: T.nilable(Integer),
      aggvariadic: T.nilable(T::Boolean),
      args: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      inputcollid: T.nilable(Integer),
      location: T.nilable(Integer),
      xpr: T.nilable(PgQuery::Node)
    ).void
  end
  def initialize(aggargtypes: T.unsafe(nil), aggcollid: nil, aggdirectargs: T.unsafe(nil), aggdistinct: T.unsafe(nil), aggfilter: nil, aggfnoid: nil, aggkind: nil, agglevelsup: nil, aggno: nil, aggorder: T.unsafe(nil), aggsplit: nil, aggstar: nil, aggtransno: nil, aggtype: nil, aggvariadic: nil, args: T.unsafe(nil), inputcollid: nil, location: nil, xpr: nil); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def aggargtypes; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def aggargtypes=(value); end

  sig { returns(Integer) }
  def aggcollid; end

  sig { params(value: Integer).void }
  def aggcollid=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def aggdirectargs; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def aggdirectargs=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def aggdistinct; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def aggdistinct=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def aggfilter; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def aggfilter=(value); end

  sig { returns(Integer) }
  def aggfnoid; end

  sig { params(value: Integer).void }
  def aggfnoid=(value); end

  sig { returns(String) }
  def aggkind; end

  sig { params(value: String).void }
  def aggkind=(value); end

  sig { returns(Integer) }
  def agglevelsup; end

  sig { params(value: Integer).void }
  def agglevelsup=(value); end

  sig { returns(Integer) }
  def aggno; end

  sig { params(value: Integer).void }
  def aggno=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def aggorder; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def aggorder=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def aggsplit; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def aggsplit=(value); end

  sig { returns(T::Boolean) }
  def aggstar; end

  sig { params(value: T::Boolean).void }
  def aggstar=(value); end

  sig { returns(Integer) }
  def aggtransno; end

  sig { params(value: Integer).void }
  def aggtransno=(value); end

  sig { returns(Integer) }
  def aggtype; end

  sig { params(value: Integer).void }
  def aggtype=(value); end

  sig { returns(T::Boolean) }
  def aggvariadic; end

  sig { params(value: T::Boolean).void }
  def aggvariadic=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def args; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def args=(value); end

  sig { void }
  def clear_aggargtypes; end

  sig { void }
  def clear_aggcollid; end

  sig { void }
  def clear_aggdirectargs; end

  sig { void }
  def clear_aggdistinct; end

  sig { void }
  def clear_aggfilter; end

  sig { void }
  def clear_aggfnoid; end

  sig { void }
  def clear_aggkind; end

  sig { void }
  def clear_agglevelsup; end

  sig { void }
  def clear_aggno; end

  sig { void }
  def clear_aggorder; end

  sig { void }
  def clear_aggsplit; end

  sig { void }
  def clear_aggstar; end

  sig { void }
  def clear_aggtransno; end

  sig { void }
  def clear_aggtype; end

  sig { void }
  def clear_aggvariadic; end

  sig { void }
  def clear_args; end

  sig { void }
  def clear_inputcollid; end

  sig { void }
  def clear_location; end

  sig { void }
  def clear_xpr; end

  sig { returns(Object) }
  def has_aggfilter?; end

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

  sig { returns(T.nilable(PgQuery::Node)) }
  def xpr; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def xpr=(value); end
end
