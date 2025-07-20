# typed: true
# frozen_string_literal: true

class ActivityCoupon
  class ExpiryFormatter
    extend T::Sig
    include Singleton
    include ActionView::Helpers::DateHelper

    sig { params(time: Time).returns(String) }
    def self.relative_to_now(time)
      instance.distance_of_time_in_words_to_now(time)
    end
  end
end
