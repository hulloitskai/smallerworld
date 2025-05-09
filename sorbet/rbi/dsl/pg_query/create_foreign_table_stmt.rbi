# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::CreateForeignTableStmt`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::CreateForeignTableStmt`.


class PgQuery::CreateForeignTableStmt < Google::Protobuf::AbstractMessage
  sig do
    params(
      base_stmt: T.nilable(PgQuery::CreateStmt),
      options: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      servername: T.nilable(String)
    ).void
  end
  def initialize(base_stmt: nil, options: T.unsafe(nil), servername: nil); end

  sig { returns(T.nilable(PgQuery::CreateStmt)) }
  def base_stmt; end

  sig { params(value: T.nilable(PgQuery::CreateStmt)).void }
  def base_stmt=(value); end

  sig { void }
  def clear_base_stmt; end

  sig { void }
  def clear_options; end

  sig { void }
  def clear_servername; end

  sig { returns(Object) }
  def has_base_stmt?; end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def options; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def options=(value); end

  sig { returns(String) }
  def servername; end

  sig { params(value: String).void }
  def servername=(value); end
end
