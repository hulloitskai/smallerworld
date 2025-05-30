# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::DiscardStmt`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::DiscardStmt`.


class PgQuery::DiscardStmt < Google::Protobuf::AbstractMessage
  sig { params(target: T.nilable(T.any(Symbol, Integer))).void }
  def initialize(target: nil); end

  sig { void }
  def clear_target; end

  sig { returns(T.any(Symbol, Integer)) }
  def target; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def target=(value); end
end
