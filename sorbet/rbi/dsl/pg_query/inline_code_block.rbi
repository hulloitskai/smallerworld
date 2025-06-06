# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::InlineCodeBlock`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::InlineCodeBlock`.


class PgQuery::InlineCodeBlock < Google::Protobuf::AbstractMessage
  sig do
    params(
      atomic: T.nilable(T::Boolean),
      lang_is_trusted: T.nilable(T::Boolean),
      lang_oid: T.nilable(Integer),
      source_text: T.nilable(String)
    ).void
  end
  def initialize(atomic: nil, lang_is_trusted: nil, lang_oid: nil, source_text: nil); end

  sig { returns(T::Boolean) }
  def atomic; end

  sig { params(value: T::Boolean).void }
  def atomic=(value); end

  sig { void }
  def clear_atomic; end

  sig { void }
  def clear_lang_is_trusted; end

  sig { void }
  def clear_lang_oid; end

  sig { void }
  def clear_source_text; end

  sig { returns(T::Boolean) }
  def lang_is_trusted; end

  sig { params(value: T::Boolean).void }
  def lang_is_trusted=(value); end

  sig { returns(Integer) }
  def lang_oid; end

  sig { params(value: Integer).void }
  def lang_oid=(value); end

  sig { returns(String) }
  def source_text; end

  sig { params(value: String).void }
  def source_text=(value); end
end
