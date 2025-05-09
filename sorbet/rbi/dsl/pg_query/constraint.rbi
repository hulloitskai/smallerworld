# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::Constraint`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::Constraint`.


class PgQuery::Constraint < Google::Protobuf::AbstractMessage
  sig do
    params(
      access_method: T.nilable(String),
      conname: T.nilable(String),
      contype: T.nilable(T.any(Symbol, Integer)),
      cooked_expr: T.nilable(String),
      deferrable: T.nilable(T::Boolean),
      exclusions: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      fk_attrs: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      fk_del_action: T.nilable(String),
      fk_del_set_cols: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      fk_matchtype: T.nilable(String),
      fk_upd_action: T.nilable(String),
      generated_when: T.nilable(String),
      including: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      indexname: T.nilable(String),
      indexspace: T.nilable(String),
      inhcount: T.nilable(Integer),
      initdeferred: T.nilable(T::Boolean),
      initially_valid: T.nilable(T::Boolean),
      is_no_inherit: T.nilable(T::Boolean),
      keys: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      location: T.nilable(Integer),
      nulls_not_distinct: T.nilable(T::Boolean),
      old_conpfeqop: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      old_pktable_oid: T.nilable(Integer),
      options: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      pk_attrs: T.nilable(T.any(Google::Protobuf::RepeatedField[PgQuery::Node], T::Array[PgQuery::Node])),
      pktable: T.nilable(PgQuery::RangeVar),
      raw_expr: T.nilable(PgQuery::Node),
      reset_default_tblspc: T.nilable(T::Boolean),
      skip_validation: T.nilable(T::Boolean),
      where_clause: T.nilable(PgQuery::Node)
    ).void
  end
  def initialize(access_method: nil, conname: nil, contype: nil, cooked_expr: nil, deferrable: nil, exclusions: T.unsafe(nil), fk_attrs: T.unsafe(nil), fk_del_action: nil, fk_del_set_cols: T.unsafe(nil), fk_matchtype: nil, fk_upd_action: nil, generated_when: nil, including: T.unsafe(nil), indexname: nil, indexspace: nil, inhcount: nil, initdeferred: nil, initially_valid: nil, is_no_inherit: nil, keys: T.unsafe(nil), location: nil, nulls_not_distinct: nil, old_conpfeqop: T.unsafe(nil), old_pktable_oid: nil, options: T.unsafe(nil), pk_attrs: T.unsafe(nil), pktable: nil, raw_expr: nil, reset_default_tblspc: nil, skip_validation: nil, where_clause: nil); end

  sig { returns(String) }
  def access_method; end

  sig { params(value: String).void }
  def access_method=(value); end

  sig { void }
  def clear_access_method; end

  sig { void }
  def clear_conname; end

  sig { void }
  def clear_contype; end

  sig { void }
  def clear_cooked_expr; end

  sig { void }
  def clear_deferrable; end

  sig { void }
  def clear_exclusions; end

  sig { void }
  def clear_fk_attrs; end

  sig { void }
  def clear_fk_del_action; end

  sig { void }
  def clear_fk_del_set_cols; end

  sig { void }
  def clear_fk_matchtype; end

  sig { void }
  def clear_fk_upd_action; end

  sig { void }
  def clear_generated_when; end

  sig { void }
  def clear_including; end

  sig { void }
  def clear_indexname; end

  sig { void }
  def clear_indexspace; end

  sig { void }
  def clear_inhcount; end

  sig { void }
  def clear_initdeferred; end

  sig { void }
  def clear_initially_valid; end

  sig { void }
  def clear_is_no_inherit; end

  sig { void }
  def clear_keys; end

  sig { void }
  def clear_location; end

  sig { void }
  def clear_nulls_not_distinct; end

  sig { void }
  def clear_old_conpfeqop; end

  sig { void }
  def clear_old_pktable_oid; end

  sig { void }
  def clear_options; end

  sig { void }
  def clear_pk_attrs; end

  sig { void }
  def clear_pktable; end

  sig { void }
  def clear_raw_expr; end

  sig { void }
  def clear_reset_default_tblspc; end

  sig { void }
  def clear_skip_validation; end

  sig { void }
  def clear_where_clause; end

  sig { returns(String) }
  def conname; end

  sig { params(value: String).void }
  def conname=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def contype; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def contype=(value); end

  sig { returns(String) }
  def cooked_expr; end

  sig { params(value: String).void }
  def cooked_expr=(value); end

  sig { returns(T::Boolean) }
  def deferrable; end

  sig { params(value: T::Boolean).void }
  def deferrable=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def exclusions; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def exclusions=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def fk_attrs; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def fk_attrs=(value); end

  sig { returns(String) }
  def fk_del_action; end

  sig { params(value: String).void }
  def fk_del_action=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def fk_del_set_cols; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def fk_del_set_cols=(value); end

  sig { returns(String) }
  def fk_matchtype; end

  sig { params(value: String).void }
  def fk_matchtype=(value); end

  sig { returns(String) }
  def fk_upd_action; end

  sig { params(value: String).void }
  def fk_upd_action=(value); end

  sig { returns(String) }
  def generated_when; end

  sig { params(value: String).void }
  def generated_when=(value); end

  sig { returns(Object) }
  def has_pktable?; end

  sig { returns(Object) }
  def has_raw_expr?; end

  sig { returns(Object) }
  def has_where_clause?; end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def including; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def including=(value); end

  sig { returns(String) }
  def indexname; end

  sig { params(value: String).void }
  def indexname=(value); end

  sig { returns(String) }
  def indexspace; end

  sig { params(value: String).void }
  def indexspace=(value); end

  sig { returns(Integer) }
  def inhcount; end

  sig { params(value: Integer).void }
  def inhcount=(value); end

  sig { returns(T::Boolean) }
  def initdeferred; end

  sig { params(value: T::Boolean).void }
  def initdeferred=(value); end

  sig { returns(T::Boolean) }
  def initially_valid; end

  sig { params(value: T::Boolean).void }
  def initially_valid=(value); end

  sig { returns(T::Boolean) }
  def is_no_inherit; end

  sig { params(value: T::Boolean).void }
  def is_no_inherit=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def keys; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def keys=(value); end

  sig { returns(Integer) }
  def location; end

  sig { params(value: Integer).void }
  def location=(value); end

  sig { returns(T::Boolean) }
  def nulls_not_distinct; end

  sig { params(value: T::Boolean).void }
  def nulls_not_distinct=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def old_conpfeqop; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def old_conpfeqop=(value); end

  sig { returns(Integer) }
  def old_pktable_oid; end

  sig { params(value: Integer).void }
  def old_pktable_oid=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def options; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def options=(value); end

  sig { returns(Google::Protobuf::RepeatedField[PgQuery::Node]) }
  def pk_attrs; end

  sig { params(value: Google::Protobuf::RepeatedField[PgQuery::Node]).void }
  def pk_attrs=(value); end

  sig { returns(T.nilable(PgQuery::RangeVar)) }
  def pktable; end

  sig { params(value: T.nilable(PgQuery::RangeVar)).void }
  def pktable=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def raw_expr; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def raw_expr=(value); end

  sig { returns(T::Boolean) }
  def reset_default_tblspc; end

  sig { params(value: T::Boolean).void }
  def reset_default_tblspc=(value); end

  sig { returns(T::Boolean) }
  def skip_validation; end

  sig { params(value: T::Boolean).void }
  def skip_validation=(value); end

  sig { returns(T.nilable(PgQuery::Node)) }
  def where_clause; end

  sig { params(value: T.nilable(PgQuery::Node)).void }
  def where_clause=(value); end
end
