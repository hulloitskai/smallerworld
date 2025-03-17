# typed: true
# frozen_string_literal: true

module SupabaseAuthentication
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  # == Constants
  SUPABASE_BASE64_PREFIX = "base64-"
  SUPABASE_AUTHENTICATION_IVARS = %i[
    @_supabase_session_data
    @_supabase_auth_claims
    @_current_user
  ].freeze

  requires_ancestor { ActionController::Base }

  included do
    T.bind(self, T.class_of(ActionController::Base))

    before_action :refresh_supabase_session_if_necessary!
  end

  private

  # == Helpers
  sig { params(value: String).returns(T.nilable(T::Hash[String, T.untyped])) }
  def decode_supabase_session_cookie(value)
    unless value.starts_with?(SUPABASE_BASE64_PREFIX)
      return
    end

    encoded_value = value.delete_prefix(SUPABASE_BASE64_PREFIX)
    decoded_value = Base64.urlsafe_decode64(encoded_value)
    JSON.parse(decoded_value)
  end

  sig { params(data: T::Hash[String, T.untyped]).returns(String) }
  def encode_supabase_session_cookie(data)
    encoded_value = Base64.urlsafe_encode64(JSON.generate(data))
    "#{SUPABASE_BASE64_PREFIX}#{encoded_value}"
  end

  sig { returns(T.nilable(T::Hash[String, T.untyped])) }
  def supabase_session_data
    return @_supabase_session_data if defined?(@_supabase_session_data)

    @_supabase_session_data = if (encoded_cookie = cookies[:supabase_session])
      decode_supabase_session_cookie(encoded_cookie)
    end
  end

  sig { returns(T.nilable(T::Hash[String, T.untyped])) }
  def supabase_auth_claims
    return @_supabase_auth_claims if defined?(@_supabase_auth_claims)

    @_supabase_auth_claims = if (session_data = supabase_session_data)
      access_token = session_data.fetch("access_token")
      suppress(JWT::ExpiredSignature) do
        all_claims = JWT.decode(
          access_token,
          supabase_jwt_secret,
          true,
          { algorithm: "HS256" },
        )
        all_claims.first
      end
    end
  end

  sig { returns(String) }
  def supabase_jwt_secret
    Rails.application.credentials.supabase!.jwt_secret!
  end

  sig { returns(T.nilable(User)) }
  def current_user
    return @_current_user if defined?(@_current_user)

    @_current_user = if (claims = supabase_auth_claims) && (id = claims["sub"])
      User.find_by(id:)
    end
  end

  sig { returns(T::Boolean) }
  def supabase_authenticated?
    if (claims = supabase_auth_claims)
      claims["role"] == "authenticated"
    else
      false
    end
  end

  sig { void }
  def refresh_supabase_session_if_necessary!
    session_data = supabase_session_data or return
    access_token = session_data.fetch("access_token")
    refresh_token = session_data.fetch("refresh_token")
    begin
      JWT.decode(
        access_token,
        supabase_jwt_secret,
        true,
        { algorithm: "HS256" },
      )
    rescue JWT::ExpiredSignature
      session_data = refresh_supabase_session(refresh_token:)
      cookies[:supabase_session] = {
        value: encode_supabase_session_cookie(session_data),
        secure: Rails.env.production?,
        expires: 1.year.from_now,
      }
      reset_supabase_authentication!
    end
  end

  sig { void }
  def reset_supabase_authentication!
    SUPABASE_AUTHENTICATION_IVARS.each do |ivar|
      remove_instance_variable(ivar) if instance_variable_defined?(ivar)
    end
  end

  sig { params(refresh_token: String).returns(T::Hash[String, T.untyped]) }
  def refresh_supabase_session(refresh_token:)
    response = Supabase.client.post(
      "/auth/v1/token",
      { "refresh_token" => refresh_token },
    ) do |req|
      req.params["grant_type"] = "refresh_token"
    end
    response.body.tap do |session_data|
      unless session_data.is_a?(Hash) &&
          session_data.dig("user", "role") == "authenticated"
        raise "Failed to refresh Supabase session"
      end
    end
  end

  # == Filter handlers
  sig { returns(User) }
  def authenticate_user!
    current_user or raise UnauthenticatedError
  end

  sig { void }
  def require_supabase_authentication!
    raise UnauthenticatedError unless supabase_authenticated?
  end
end
