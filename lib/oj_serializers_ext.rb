# typed: true
# frozen_string_literal: true

require "rails"
require "oj_serializers"

class OjSerializers::Serializer
  # NOTE: Add :nullable to known attribute options.
  module AddNullableAttributeOption
    extend ActiveSupport::Concern

    included do
      known_attribute_options = const_get(:KNOWN_ATTRIBUTE_OPTIONS) # rubocop:disable Sorbet/ConstantsFromStrings
      remove_const(:KNOWN_ATTRIBUTE_OPTIONS)
      const_set(
        :KNOWN_ATTRIBUTE_OPTIONS,
        [*known_attribute_options, :nullable].to_set,
      )
    end
  end
  include AddNullableAttributeOption
end
