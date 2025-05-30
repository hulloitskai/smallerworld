# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::ColumnRef`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::ColumnRef`.


class PgQuery::ColumnRef < Google::Protobuf::AbstractMessage
  sig do
    params(
      fields: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      location: T.nilable(Integer)
    ).void
  end
  def initialize(fields: T.unsafe(nil), location: nil); end

  sig { void }
  def clear_fields; end

  sig { void }
  def clear_location; end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def fields; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def fields=(value); end

  sig { returns(Integer) }
  def location; end

  sig { params(value: Integer).void }
  def location=(value); end
end
