# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::WindowClause`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::WindowClause`.


class PgQuery::WindowClause < Google::Protobuf::AbstractMessage
  sig do
    params(
      copied_order: T.nilable(T::Boolean),
      end_in_range_func: T.nilable(Integer),
      end_offset: T.nilable(PgQuery::Node),
      frame_options: T.nilable(Integer),
      in_range_asc: T.nilable(T::Boolean),
      in_range_coll: T.nilable(Integer),
      in_range_nulls_first: T.nilable(T::Boolean),
      name: T.nilable(String),
      order_clause: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      partition_clause: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      refname: T.nilable(String),
      start_in_range_func: T.nilable(Integer),
      start_offset: T.nilable(PgQuery::Node),
      winref: T.nilable(Integer)
    ).void
  end
  def initialize(copied_order: nil, end_in_range_func: nil, end_offset: nil, frame_options: nil, in_range_asc: nil, in_range_coll: nil, in_range_nulls_first: nil, name: nil, order_clause: T.unsafe(nil), partition_clause: T.unsafe(nil), refname: nil, start_in_range_func: nil, start_offset: nil, winref: nil); end

  sig { void }
  def clear_copied_order; end

  sig { void }
  def clear_end_in_range_func; end

  sig { void }
  def clear_end_offset; end

  sig { void }
  def clear_frame_options; end

  sig { void }
  def clear_in_range_asc; end

  sig { void }
  def clear_in_range_coll; end

  sig { void }
  def clear_in_range_nulls_first; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_order_clause; end

  sig { void }
  def clear_partition_clause; end

  sig { void }
  def clear_refname; end

  sig { void }
  def clear_start_in_range_func; end

  sig { void }
  def clear_start_offset; end

  sig { void }
  def clear_winref; end

  sig { returns(T::Boolean) }
  def copied_order; end

  sig { params(value: T::Boolean).void }
  def copied_order=(value); end

  sig { returns(Integer) }
  def end_in_range_func; end

  sig { params(value: Integer).void }
  def end_in_range_func=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def end_offset; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def end_offset=(value); end

  sig { returns(Integer) }
  def frame_options; end

  sig { params(value: Integer).void }
  def frame_options=(value); end

  sig { returns(Object) }
  def has_end_offset?; end

  sig { returns(Object) }
  def has_start_offset?; end

  sig { returns(T::Boolean) }
  def in_range_asc; end

  sig { params(value: T::Boolean).void }
  def in_range_asc=(value); end

  sig { returns(Integer) }
  def in_range_coll; end

  sig { params(value: Integer).void }
  def in_range_coll=(value); end

  sig { returns(T::Boolean) }
  def in_range_nulls_first; end

  sig { params(value: T::Boolean).void }
  def in_range_nulls_first=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def order_clause; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def order_clause=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def partition_clause; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def partition_clause=(value); end

  sig { returns(String) }
  def refname; end

  sig { params(value: String).void }
  def refname=(value); end

  sig { returns(Integer) }
  def start_in_range_func; end

  sig { params(value: Integer).void }
  def start_in_range_func=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def start_offset; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def start_offset=(value); end

  sig { returns(Integer) }
  def winref; end

  sig { params(value: Integer).void }
  def winref=(value); end
end
