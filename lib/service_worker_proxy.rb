# typed: true
# frozen_string_literal: true

require "vite_ruby"
require "addressable"

class ServiceWorkerProxy
  extend T::Sig

  sig { params(app: T.untyped).void }
  def initialize(app)
    @app = app
    @proxy = ViteRuby::DevServerProxy.new(app, streaming: true)
  end

  sig { params(env: T::Hash[String, T.untyped]).returns(T.untyped) }
  def call(env)
    path = T.let(env.fetch("PATH_INFO"), String)
    query_values = Addressable::URI
      .parse(env.fetch("REQUEST_URI"))
      .query_values(Hash) || {}
    if path == "/sw.js"
      if dev_server_running?
        rewritten_env = if query_values["worker_src"].present?
          deprecated_rewrite_env(env)
        else
          path = sw_path(query_values.fetch("worker", "dev-sw.js"))
          rewrite_env(env, path:, query_string: "dev-sw")
        end
        @proxy.call(rewritten_env)
      else
        files = Rack::Files.new(Rails.public_path.to_s)
        rewritten_env = if query_values["worker_src"].present?
          deprecated_rewrite_env(env)
        else
          path = sw_path(query_values.fetch("worker", "sw.js"))
          rewrite_env(env, path:)
        end
        files.call(rewritten_env)
      end
    else
      @app.call(env)
    end
  end

  private

  # == Helpers
  delegate :dev_server_running?, to: :@proxy

  sig { params(filename: String).returns(String) }
  def sw_path(filename)
    @sw_path ||= Pathname.new("/")
      .join(ViteRuby.config.public_output_dir, filename)
      .to_s
  end

  sig do
    params(
      env: T::Hash[String, T.untyped],
      path: String,
      query_string: String,
    ).returns(T::Hash[String, T.untyped])
  end
  def rewrite_env(env, path:, query_string: "")
    env.merge(
      "PATH_INFO" => path,
      "REQUEST_PATH" => path,
      "REQUEST_URI" => [path, query_string].compact_blank.join("?"),
      "QUERY_STRING" => query_string,
    )
  end

  sig do
    params(env: T::Hash[String, T.untyped])
      .returns(T::Hash[String, T.untyped])
  end
  def deprecated_rewrite_env(env)
    query_values = Addressable::URI.parse(env.fetch("REQUEST_URI")).query_values
    worker_uri = Addressable::URI.parse(query_values.fetch("worker_src"))
    env.merge(
      "PATH_INFO" => worker_uri.path,
      "REQUEST_PATH" => worker_uri.path,
      "REQUEST_URI" => worker_uri.to_s,
      "QUERY_STRING" => worker_uri.query,
    )
  end
end
