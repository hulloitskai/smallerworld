# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::ClosePortalStmt`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::ClosePortalStmt`.


class PgQuery::ClosePortalStmt < Google::Protobuf::AbstractMessage
  sig { params(portalname: T.nilable(String)).void }
  def initialize(portalname: nil); end

  sig { void }
  def clear_portalname; end

  sig { returns(String) }
  def portalname; end

  sig { params(value: String).void }
  def portalname=(value); end
end
