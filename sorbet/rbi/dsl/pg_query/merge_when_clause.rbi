# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::MergeWhenClause`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::MergeWhenClause`.


class PgQuery::MergeWhenClause < Google::Protobuf::AbstractMessage
  sig do
    params(
      command_type: T.nilable(T.any(Symbol, Integer)),
      condition: T.nilable(PgQuery::Node),
      match_kind: T.nilable(T.any(Symbol, Integer)),
      override: T.nilable(T.any(Symbol, Integer)),
      target_list: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      values: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node]))
    ).void
  end
  def initialize(command_type: nil, condition: nil, match_kind: nil, override: nil, target_list: T.unsafe(nil), values: T.unsafe(nil)); end

  sig { void }
  def clear_command_type; end

  sig { void }
  def clear_condition; end

  sig { void }
  def clear_match_kind; end

  sig { void }
  def clear_override; end

  sig { void }
  def clear_target_list; end

  sig { void }
  def clear_values; end

  sig { returns(T.any(Symbol, Integer)) }
  def command_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def command_type=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def condition; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def condition=(value); end

  sig { returns(Object) }
  def has_condition?; end

  sig { returns(T.any(Symbol, Integer)) }
  def match_kind; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def match_kind=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def override; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def override=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def target_list; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def target_list=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def values; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def values=(value); end
end
