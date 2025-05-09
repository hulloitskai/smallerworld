# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::DropStmt`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::DropStmt`.


class PgQuery::DropStmt < Google::Protobuf::AbstractMessage
  sig do
    params(
      behavior: T.nilable(T.any(Symbol, Integer)),
      concurrent: T.nilable(T::Boolean),
      missing_ok: T.nilable(T::Boolean),
      objects: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      remove_type: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(behavior: nil, concurrent: nil, missing_ok: nil, objects: T.unsafe(nil), remove_type: nil); end

  sig { returns(T.any(Symbol, Integer)) }
  def behavior; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def behavior=(value); end

  sig { void }
  def clear_behavior; end

  sig { void }
  def clear_concurrent; end

  sig { void }
  def clear_missing_ok; end

  sig { void }
  def clear_objects; end

  sig { void }
  def clear_remove_type; end

  sig { returns(T::Boolean) }
  def concurrent; end

  sig { params(value: T::Boolean).void }
  def concurrent=(value); end

  sig { returns(T::Boolean) }
  def missing_ok; end

  sig { params(value: T::Boolean).void }
  def missing_ok=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def objects; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def objects=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def remove_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def remove_type=(value); end
end
