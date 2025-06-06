# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::JoinType`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::JoinType`.


module PgQuery::JoinType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

PgQuery::JoinType::JOIN_ANTI = 6
PgQuery::JoinType::JOIN_FULL = 3
PgQuery::JoinType::JOIN_INNER = 1
PgQuery::JoinType::JOIN_LEFT = 2
PgQuery::JoinType::JOIN_RIGHT = 4
PgQuery::JoinType::JOIN_RIGHT_ANTI = 7
PgQuery::JoinType::JOIN_SEMI = 5
PgQuery::JoinType::JOIN_TYPE_UNDEFINED = 0
PgQuery::JoinType::JOIN_UNIQUE_INNER = 9
PgQuery::JoinType::JOIN_UNIQUE_OUTER = 8
