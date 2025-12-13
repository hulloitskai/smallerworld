# typed: true
# frozen_string_literal: true

module PgSearch
  module Model::ClassMethods
    # NOTE: Track scope names in order to generate RBI typings for them.
    module TrackScopeNames
      extend T::Sig

      # == Methods
      sig { params(name: Symbol, options: T.untyped).void }
      def pg_search_scope(name, options)
        super
        pg_search_scope_names << name
      end

      sig { returns(T::Array[Symbol]) }
      def pg_search_scope_names
        @pg_search_scope_names ||= T.let([], T.nilable(T::Array[Symbol]))
      end
    end
    prepend TrackScopeNames
  end

  module Features
    class TSearch
      module Websearch
        extend ActiveSupport::Concern
        extend T::Sig
        extend T::Helpers

        requires_ancestor { TSearch }

        sig { returns(String) }
        def tsquery
          if options[:websearch]
            return "''" if query.blank?

            term_sql = Arel.sql(normalize(connection.quote(query)))
            Arel::Nodes::NamedFunction.new(
              "websearch_to_tsquery",
              [ dictionary, term_sql ],
            ).to_sql
          else
            super
          end
        end

        class_methods do
          extend T::Sig

          sig { returns(T::Array[Symbol]) }
          def valid_options
            super + %i[websearch]
          end
        end
      end

      prepend Websearch
    end
  end
end
