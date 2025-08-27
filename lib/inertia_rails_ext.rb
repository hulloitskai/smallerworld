# typed: true
# frozen_string_literal: true

require_relative "inertia_rails_ext/engine"
require_relative "inertia_rails_ext/mailer"
require_relative "inertia_rails_ext/controller"
require_relative "inertia_rails_ext/middleware"

module InertiaRails
  extend T::Sig

  sig do
    type_parameters(:T)
      .params(block: T.proc.returns(T.type_parameter(:T)))
      .returns(T.type_parameter(:T))
  end
  def self.with_ssr(&block)
    prev_ssr_enabled = configuration.ssr_enabled
    configuration.ssr_enabled = true
    begin
      yield
    ensure
      configuration.ssr_enabled = prev_ssr_enabled
    end
  end
end
