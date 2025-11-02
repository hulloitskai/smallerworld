# typed: true
# frozen_string_literal: true

require "vite_ruby"

class ViteRuby
  extend T::Sig

  # == Attributes
  class_attribute :dev_server_disabled, default: false
  class_attribute :auto_build_disabled, default: false

  # == Methods
  sig do
    type_parameters(:U).params(
      block: T.proc.returns(T.type_parameter(:U)),
    ).returns(T.type_parameter(:U))
  end
  def self.without_dev_server(&block)
    if dev_server_disabled
      yield
    else
      self.dev_server_disabled = true
      begin
        yield
      ensure
        self.dev_server_disabled = false
      end
    end
  end

  sig do
    type_parameters(:U).params(
      block: T.proc.returns(T.type_parameter(:U)),
    ).returns(T.type_parameter(:U))
  end
  def self.without_auto_build(&block)
    if auto_build_disabled
      yield
    else
      self.auto_build_disabled = true
      begin
        yield
      ensure
        self.auto_build_disabled = false
      end
    end
  end

  # Allows disabling the dev server.
  module DisableDevServerSupport
    extend T::Sig
    extend T::Helpers

    requires_ancestor { ViteRuby }

    sig { returns(T::Boolean) }
    def dev_server_running?
      !ViteRuby.dev_server_disabled && super
    end
  end
  prepend DisableDevServerSupport

  class DevServerProxy
    # Allows disabling the dev server.
    module DisableDevServerSupport
      extend T::Sig
      extend T::Helpers

      requires_ancestor { DevServerProxy }

      # == Methods
      sig { params(env: T::Hash[String, T.untyped]).returns(T::Boolean) }
      def vite_should_handle?(env)
        uri = env.fetch("REQUEST_URI")
        !uri_forces_ssr?(uri) && !!super
      end

      sig { returns(T::Boolean) }
      def dev_server_running?
        !ViteRuby.dev_server_disabled? && super
      end

      private

      sig { params(uri: String).returns(T::Boolean) }
      def uri_forces_ssr?(uri)
        if (query = Addressable::URI.parse(uri).query_values)
          query["ssr"].truthy?
        else
          false
        end
      end

      # sig { params(env: T::Hash[String, T.untyped]).returns(T::Boolean) }
      # def url_or_referrer_forces_ssr?(env)
      #   return true if uri_forces_ssr?(env["REQUEST_URI"])

      #   if (referrer = env["HTTP_REFERER"])
      #     uri_forces_ssr?(referrer)
      #   else
      #     false
      #   end
      # end
    end
    prepend DisableDevServerSupport
  end

  class Manifest
    # Allows disabling auto build.
    module DisableAutoBuildSupport
      extend T::Sig
      extend T::Helpers

      requires_ancestor { Manifest }

      private

      sig { returns(T::Boolean) }
      def should_build?
        !ViteRuby.auto_build_disabled? && super
      end
    end
    prepend DisableAutoBuildSupport

    # module InertiaSSRSupport
    #   extend T::Sig
    #   extend T::Helpers

    #   requires_ancestor { Manifest }

    #   def resolve_entries(*names, **options)
    #     entries = super
    #     if inerta_ssr_enabled?
    #       entries.transform_values do |paths|
    #         paths.map { |path| path + "?ssr=1" }
    #       end
    #     else
    #       entries
    #     end
    #   end

    #   private

    #   sig { returns(T::Boolean) }
    #   def inerta_ssr_enabled?
    #     InertiaRails.configuration.ssr_enabled
    #   end
    # end
    # prepend InertiaSSRSupport
  end
end
