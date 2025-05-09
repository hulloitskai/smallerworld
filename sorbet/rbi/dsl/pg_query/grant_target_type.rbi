# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::GrantTargetType`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::GrantTargetType`.


module PgQuery::GrantTargetType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

PgQuery::GrantTargetType::ACL_TARGET_ALL_IN_SCHEMA = 2
PgQuery::GrantTargetType::ACL_TARGET_DEFAULTS = 3
PgQuery::GrantTargetType::ACL_TARGET_OBJECT = 1
PgQuery::GrantTargetType::GRANT_TARGET_TYPE_UNDEFINED = 0
