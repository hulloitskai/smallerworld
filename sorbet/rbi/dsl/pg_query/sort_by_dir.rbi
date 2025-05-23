# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PgQuery::SortByDir`.
# Please instead update this file by running `bin/tapioca dsl PgQuery::SortByDir`.


module PgQuery::SortByDir
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

PgQuery::SortByDir::SORTBY_ASC = 2
PgQuery::SortByDir::SORTBY_DEFAULT = 1
PgQuery::SortByDir::SORTBY_DESC = 3
PgQuery::SortByDir::SORTBY_USING = 4
PgQuery::SortByDir::SORT_BY_DIR_UNDEFINED = 0
