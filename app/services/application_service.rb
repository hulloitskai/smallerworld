# typed: strict
# frozen_string_literal: true

class ApplicationService
  extend T::Sig
  extend T::Helpers
  include Logging
  include Singleton

  # == Configuration ==

  sig { overridable.returns(T::Boolean) }
  def self.enabled?
    true
  end

  # == Initialization ==

  sig { void }
  def initialize
    raise "#{self.class} is not enabled" unless self.class.enabled?

    super
  end
end
