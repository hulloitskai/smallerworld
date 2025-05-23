# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::AlterEnumStmt`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::AlterEnumStmt`.


class PgQuery::AlterEnumStmt < Google::Protobuf::AbstractMessage
  sig do
    params(
      new_val: T.nilable(String),
      new_val_is_after: T.nilable(T::Boolean),
      new_val_neighbor: T.nilable(String),
      old_val: T.nilable(String),
      skip_if_new_val_exists: T.nilable(T::Boolean),
      type_name: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node]))
    ).void
  end
  def initialize(new_val: nil, new_val_is_after: nil, new_val_neighbor: nil, old_val: nil, skip_if_new_val_exists: nil, type_name: T.unsafe(nil)); end

  sig { void }
  def clear_new_val; end

  sig { void }
  def clear_new_val_is_after; end

  sig { void }
  def clear_new_val_neighbor; end

  sig { void }
  def clear_old_val; end

  sig { void }
  def clear_skip_if_new_val_exists; end

  sig { void }
  def clear_type_name; end

  sig { returns(String) }
  def new_val; end

  sig { params(value: String).void }
  def new_val=(value); end

  sig { returns(T::Boolean) }
  def new_val_is_after; end

  sig { params(value: T::Boolean).void }
  def new_val_is_after=(value); end

  sig { returns(String) }
  def new_val_neighbor; end

  sig { params(value: String).void }
  def new_val_neighbor=(value); end

  sig { returns(String) }
  def old_val; end

  sig { params(value: String).void }
  def old_val=(value); end

  sig { returns(T::Boolean) }
  def skip_if_new_val_exists; end

  sig { params(value: T::Boolean).void }
  def skip_if_new_val_exists=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def type_name; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def type_name=(value); end
end
