# typed: true
# frozen_string_literal: true

require "vite_ruby"
require "addressable"

class ServiceWorkerProxy
  extend T::Sig

  sig { params(app: T.untyped).void }
  def initialize(app)
    @proxy = ViteRuby::DevServerProxy.new(app, streaming: true)
  end

  sig { params(env: T::Hash[String, T.untyped]).returns(T.untyped) }
  def call(env)
    path = T.let(env.fetch("PATH_INFO"), String)
    query_string = T.let(env.fetch("QUERY_STRING"), String)
    query_values = Addressable::URI.parse("/?" + query_string).query_values
    env = if path == "/sw" && (worker_value = query_values["worker"])
      worker_uri = Addressable::URI.parse(worker_value)
      env.merge(
        "PATH_INFO" => worker_uri.path,
        "REQUEST_PATH" => worker_uri.path,
        "REQUEST_URI" => worker_value,
        "QUERY_STRING" => worker_uri.query,
      )
    else
      env
    end
    @proxy.call(env)
  end
end
