# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::FetchDirection`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::FetchDirection`.


module PgQuery::FetchDirection
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

PgQuery::FetchDirection::FETCH_ABSOLUTE = 3
PgQuery::FetchDirection::FETCH_BACKWARD = 2
PgQuery::FetchDirection::FETCH_DIRECTION_UNDEFINED = 0
PgQuery::FetchDirection::FETCH_FORWARD = 1
PgQuery::FetchDirection::FETCH_RELATIVE = 4
