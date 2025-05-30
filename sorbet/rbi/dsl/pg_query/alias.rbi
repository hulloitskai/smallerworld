# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::Alias`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::Alias`.


class PgQuery::Alias < Google::Protobuf::AbstractMessage
  sig do
    params(
      aliasname: T.nilable(String),
      colnames: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node]))
    ).void
  end
  def initialize(aliasname: nil, colnames: T.unsafe(nil)); end

  sig { returns(String) }
  def aliasname; end

  sig { params(value: String).void }
  def aliasname=(value); end

  sig { void }
  def clear_aliasname; end

  sig { void }
  def clear_colnames; end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def colnames; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def colnames=(value); end
end
