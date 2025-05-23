# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::AlterSystemStmt`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::AlterSystemStmt`.


class PgQuery::AlterSystemStmt < Google::Protobuf::AbstractMessage
  sig { params(setstmt: T.nilable(PgQuery::VariableSetStmt)).void }
  def initialize(setstmt: nil); end

  sig { void }
  def clear_setstmt; end

  sig { returns(Object) }
  def has_setstmt?; end

  sig { returns(T.nilable(PgQuery::VariableSetStmt)) }
  def setstmt; end

  sig { params(value: T.nilable(PgQuery::VariableSetStmt)).void }
  def setstmt=(value); end
end
