# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::GroupingSetKind`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::GroupingSetKind`.


module PgQuery::GroupingSetKind
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

PgQuery::GroupingSetKind::GROUPING_SET_CUBE = 4
PgQuery::GroupingSetKind::GROUPING_SET_EMPTY = 1
PgQuery::GroupingSetKind::GROUPING_SET_KIND_UNDEFINED = 0
PgQuery::GroupingSetKind::GROUPING_SET_ROLLUP = 3
PgQuery::GroupingSetKind::GROUPING_SET_SETS = 5
PgQuery::GroupingSetKind::GROUPING_SET_SIMPLE = 2
