# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::ListenStmt`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::ListenStmt`.


class PgQuery::ListenStmt < Google::Protobuf::AbstractMessage
  sig { params(conditionname: T.nilable(String)).void }
  def initialize(conditionname: nil); end

  sig { void }
  def clear_conditionname; end

  sig { returns(String) }
  def conditionname; end

  sig { params(value: String).void }
  def conditionname=(value); end
end
