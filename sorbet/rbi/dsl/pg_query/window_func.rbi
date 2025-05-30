# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::WindowFunc`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::WindowFunc`.


class PgQuery::WindowFunc < Google::Protobuf::AbstractMessage
  sig do
    params(
      aggfilter: T.nilable(PgQuery::Node),
      args: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      inputcollid: T.nilable(Integer),
      location: T.nilable(Integer),
      run_condition: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      winagg: T.nilable(T::Boolean),
      wincollid: T.nilable(Integer),
      winfnoid: T.nilable(Integer),
      winref: T.nilable(Integer),
      winstar: T.nilable(T::Boolean),
      wintype: T.nilable(Integer),
      xpr: T.nilable(PgQuery::Node)
    ).void
  end
  def initialize(aggfilter: nil, args: T.unsafe(nil), inputcollid: nil, location: nil, run_condition: T.unsafe(nil), winagg: nil, wincollid: nil, winfnoid: nil, winref: nil, winstar: nil, wintype: nil, xpr: nil); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def aggfilter; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def aggfilter=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def args; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def args=(value); end

  sig { void }
  def clear_aggfilter; end

  sig { void }
  def clear_args; end

  sig { void }
  def clear_inputcollid; end

  sig { void }
  def clear_location; end

  sig { void }
  def clear_run_condition; end

  sig { void }
  def clear_winagg; end

  sig { void }
  def clear_wincollid; end

  sig { void }
  def clear_winfnoid; end

  sig { void }
  def clear_winref; end

  sig { void }
  def clear_winstar; end

  sig { void }
  def clear_wintype; end

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

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def run_condition; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def run_condition=(value); end

  sig { returns(T::Boolean) }
  def winagg; end

  sig { params(value: T::Boolean).void }
  def winagg=(value); end

  sig { returns(Integer) }
  def wincollid; end

  sig { params(value: Integer).void }
  def wincollid=(value); end

  sig { returns(Integer) }
  def winfnoid; end

  sig { params(value: Integer).void }
  def winfnoid=(value); end

  sig { returns(Integer) }
  def winref; end

  sig { params(value: Integer).void }
  def winref=(value); end

  sig { returns(T::Boolean) }
  def winstar; end

  sig { params(value: T::Boolean).void }
  def winstar=(value); end

  sig { returns(Integer) }
  def wintype; end

  sig { params(value: Integer).void }
  def wintype=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def xpr; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def xpr=(value); end
end
