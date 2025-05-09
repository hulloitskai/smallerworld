# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::JsonKeyValue`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::JsonKeyValue`.


class PgQuery::JsonKeyValue < Google::Protobuf::AbstractMessage
  sig { params(key: T.nilable(PgQuery::Node), value: T.nilable(PgQuery::JsonValueExpr)).void }
  def initialize(key: nil, value: nil); end

  sig { void }
  def clear_key; end

  sig { void }
  def clear_value; end

  sig { returns(Object) }
  def has_key?; end

  sig { returns(Object) }
  def has_value?; end

  sig { returns(T.nilable(PgQuery::Node)) }
  def key; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def key=(value); end

  sig { returns(T.nilable(PgQuery::JsonValueExpr)) }
  def value; end

  sig { params(value: T.nilable(PgQuery::JsonValueExpr)).void }
  def value=(value); end
end
