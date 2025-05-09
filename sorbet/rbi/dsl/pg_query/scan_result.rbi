# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::ScanResult`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::ScanResult`.


class PgQuery::ScanResult < Google::Protobuf::AbstractMessage
  sig do
    params(
      tokens: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::ScanToken], T::Array[PgQuery::ScanToken])),
      version: T.nilable(Integer)
    ).void
  end
  def initialize(tokens: T.unsafe(nil), version: nil); end

  sig { void }
  def clear_tokens; end

  sig { void }
  def clear_version; end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::ScanToken]) }
  def tokens; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::ScanToken]).void }
  def tokens=(value); end

  sig { returns(Integer) }
  def version; end

  sig { params(value: Integer).void }
  def version=(value); end
end
