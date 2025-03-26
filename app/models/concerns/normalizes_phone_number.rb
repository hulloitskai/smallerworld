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
      normalizes(*T.unsafe(names), with: :normalize_phone_number)
    end
  end

  private

  sig { params(number: String).returns(String) }
  def normalize_phone_number(number)
    phone = Phonelib.parse(number)
    phone.to_s
  end
end
