# typed: strict
# frozen_string_literal: true

module NormalizesPhoneNumber
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  abstract!
  requires_ancestor { ActiveRecord::Base }

  class_methods do
    extend T::Sig

    sig { params(names: Symbol).void }
    def normalizes_phone_number(*names)
      T.bind(self, T.class_of(ActiveRecord::Base))
      T.unsafe(self).normalizes(*names, with: ->(number) {
        phone = Phonelib.parse(number)
        phone.to_s
      })
    end
  end
end
