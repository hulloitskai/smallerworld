# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::CreatePolicyStmt`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::CreatePolicyStmt`.


class PgQuery::CreatePolicyStmt < Google::Protobuf::AbstractMessage
  sig do
    params(
      cmd_name: T.nilable(String),
      permissive: T.nilable(T::Boolean),
      policy_name: T.nilable(String),
      qual: T.nilable(PgQuery::Node),
      roles: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      table: T.nilable(PgQuery::RangeVar),
      with_check: T.nilable(PgQuery::Node)
    ).void
  end
  def initialize(cmd_name: nil, permissive: nil, policy_name: nil, qual: nil, roles: T.unsafe(nil), table: nil, with_check: nil); end

  sig { void }
  def clear_cmd_name; end

  sig { void }
  def clear_permissive; end

  sig { void }
  def clear_policy_name; end

  sig { void }
  def clear_qual; end

  sig { void }
  def clear_roles; end

  sig { void }
  def clear_table; end

  sig { void }
  def clear_with_check; end

  sig { returns(String) }
  def cmd_name; end

  sig { params(value: String).void }
  def cmd_name=(value); end

  sig { returns(Object) }
  def has_qual?; end

  sig { returns(Object) }
  def has_table?; end

  sig { returns(Object) }
  def has_with_check?; end

  sig { returns(T::Boolean) }
  def permissive; end

  sig { params(value: T::Boolean).void }
  def permissive=(value); end

  sig { returns(String) }
  def policy_name; end

  sig { params(value: String).void }
  def policy_name=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def qual; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def qual=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def roles; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def roles=(value); end

  sig { returns(T.nilable(PgQuery::RangeVar)) }
  def table; end

  sig { params(value: T.nilable(PgQuery::RangeVar)).void }
  def table=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def with_check; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def with_check=(value); end
end
