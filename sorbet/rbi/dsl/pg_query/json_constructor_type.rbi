# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::JsonConstructorType`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::JsonConstructorType`.


module PgQuery::JsonConstructorType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

PgQuery::JsonConstructorType::JSCTOR_JSON_ARRAY = 2
PgQuery::JsonConstructorType::JSCTOR_JSON_ARRAYAGG = 4
PgQuery::JsonConstructorType::JSCTOR_JSON_OBJECT = 1
PgQuery::JsonConstructorType::JSCTOR_JSON_OBJECTAGG = 3
PgQuery::JsonConstructorType::JSCTOR_JSON_PARSE = 5
PgQuery::JsonConstructorType::JSCTOR_JSON_SCALAR = 6
PgQuery::JsonConstructorType::JSCTOR_JSON_SERIALIZE = 7
PgQuery::JsonConstructorType::JSON_CONSTRUCTOR_TYPE_UNDEFINED = 0
