# typed: true
# frozen_string_literal: true

module HasTimeZone
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  abstract!
  requires_ancestor { ActiveRecord::Base }

  # == Interfaces ==

  sig { abstract.returns(String) }
  def time_zone_name; end

  sig { abstract.params(value: String).returns(String) }
  def time_zone_name=(value); end

  # == Methods ==

  sig { returns(ActiveSupport::TimeZone) }
  def time_zone
    ActiveSupport::TimeZone.new(time_zone_name)
  end

  sig do
    params(value: T.any(String, ActiveSupport::TimeZone)).returns(T.untyped)
  end
  def time_zone=(value)
    self.time_zone_name = case value
    when String
      value
    when ActiveSupport::TimeZone
      value.tzinfo.name
    end
  end

  class_methods do
    extend T::Sig
    extend T::Helpers

    requires_ancestor { T.class_of(ActiveRecord::Base) }

    # == Helpers ==

    sig { void }
    def validates_time_zone_name
      validate(:validate_time_zone_name)
    end
  end

  private

  # == Validators ==

  sig { void }
  def validate_time_zone_name
    unless ActiveSupport::TimeZone.new(time_zone_name)
      errors.add(:time_zone_name, :invalid, message: "invalid time zone")
    end
  end
end
