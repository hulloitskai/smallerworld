# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::CurrentOfExpr`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::CurrentOfExpr`.


class PgQuery::CurrentOfExpr < Google::Protobuf::AbstractMessage
  sig do
    params(
      cursor_name: T.nilable(String),
      cursor_param: T.nilable(Integer),
      cvarno: T.nilable(Integer),
      xpr: T.nilable(PgQuery::Node)
    ).void
  end
  def initialize(cursor_name: nil, cursor_param: nil, cvarno: nil, xpr: nil); end

  sig { void }
  def clear_cursor_name; end

  sig { void }
  def clear_cursor_param; end

  sig { void }
  def clear_cvarno; end

  sig { void }
  def clear_xpr; end

  sig { returns(String) }
  def cursor_name; end

  sig { params(value: String).void }
  def cursor_name=(value); end

  sig { returns(Integer) }
  def cursor_param; end

  sig { params(value: Integer).void }
  def cursor_param=(value); end

  sig { returns(Integer) }
  def cvarno; end

  sig { params(value: Integer).void }
  def cvarno=(value); end

  sig { returns(Object) }
  def has_xpr?; end

  sig { returns(T.nilable(PgQuery::Node)) }
  def xpr; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def xpr=(value); end
end
