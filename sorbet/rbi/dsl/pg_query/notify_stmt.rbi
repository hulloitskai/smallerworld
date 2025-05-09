# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::NotifyStmt`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::NotifyStmt`.


class PgQuery::NotifyStmt < Google::Protobuf::AbstractMessage
  sig { params(conditionname: T.nilable(String), payload: T.nilable(String)).void }
  def initialize(conditionname: nil, payload: nil); end

  sig { void }
  def clear_conditionname; end

  sig { void }
  def clear_payload; end

  sig { returns(String) }
  def conditionname; end

  sig { params(value: String).void }
  def conditionname=(value); end

  sig { returns(String) }
  def payload; end

  sig { params(value: String).void }
  def payload=(value); end
end
