# typed: true
# frozen_string_literal: true

class ApplicationController < ActionController::Base
  extend T::Sig
  extend T::Helpers

  include ActiveStorage::SetCurrent
  include Pagy::Backend
  include Logging
  include RendersJsonException
  include AuthenticatesUsers
  include AuthenticatesFriends

  # == Errors
  class AuthenticationRequired < StandardError
    def initialize(message = "Missing friend access token")
      super
    end
  end

  # == Filters
  around_action :with_error_context
  if !InertiaRails.configuration.ssr_enabled && Rails.env.development?
    around_action :with_ssr
  end

  # == Inertia
  inertia_share do
    {
      csrf: {
        param: request_forgery_protection_token,
        token: form_authenticity_token,
      },
      flash: flash.to_h,
      "currentUser" => UserSerializer.one_if(current_user),
      "currentFriend" => FriendSerializer.one_if(current_friend),
    }
  end

  # == Pagy
  sig do
    params(pagy: Pagy, absolute: T::Boolean)
      .returns(T::Hash[Symbol, T.untyped])
  end
  def pagy_metadata(pagy, absolute: false)
    metadata = super
    metadata.delete(:limit) if params.exclude?(pagy.vars[:limit_param])
    metadata
  end

  # == Exception handling
  rescue_from RuntimeError,
              ActiveRecord::RecordNotSaved,
              with: :handle_runtime_error
  rescue_from ActionPolicy::Unauthorized, with: :handle_unauthorized
  rescue_from ActionController::InvalidAuthenticityToken,
              with: :handle_invalid_authenticity_token
  rescue_from UnauthenticatedError, with: :handle_unauthenticated_error
  rescue_from AuthenticationRequired, with: :handle_authentication_required

  private

  # == Helpers
  sig { returns(T::Boolean) }
  def signed_in?
    current_user.present?
  end

  sig { returns(T::Hash[Symbol, T.untyped]) }
  def error_context
    if (user = current_user)
      { user_id: user.id, user_phone: user.phone_number }
    else
      {}
    end
  end

  # == Filter handlers
  sig { returns(T.any(Friend, User)) }
  def require_authentication!
    current_friend || current_user or raise AuthenticationRequired
  end

  # sig { void }
  # def debug_action
  #   targets = params[:debug]
  #   if targets.is_a?(String) && targets.split(",").include?("action")
  #     target = "#{self.class.name}##{action_name}"
  #     binding.break(do: "break #{target} pre: delete 0")
  #   end
  # end

  sig { params(block: T.proc.returns(T.untyped)).void }
  def with_error_context(&block)
    context = error_context.compact
    Rails.error.set_context(**context)
    yield
  end

  sig { params(block: T.proc.returns(T.untyped)).void }
  def with_ssr(&block)
    if params[:ssr].truthy?
      vite_dev_server_disabled = ViteRuby.dev_server_disabled?
      inertia_ssr_enabled = InertiaRails.configuration.ssr_enabled
      begin
        ViteRuby.dev_server_disabled = true
        InertiaRails.configuration.ssr_enabled = true
        yield
      ensure
        InertiaRails.configuration.ssr_enabled = inertia_ssr_enabled
        ViteRuby.dev_server_disabled = vite_dev_server_disabled
      end
    else
      yield
    end
  end

  sig { params(error: RuntimeError).void }
  def handle_runtime_error(error)
    report_exception(error)
    respond_to do |format|
      format.html do
        status = 500
        render(
          inertia: "ErrorPage",
          props: {
            title: "an unexpected error occurred",
            description: error.message,
            code: status,
            error: nil,
          },
          status:,
        )
      end
      format.all do
        render_json_exception(error)
      end
    end
  end

  sig { params(error: UnauthenticatedError).void }
  def handle_unauthenticated_error(error)
    respond_to do |format|
      format.html do
        if valid_registration_token?
          redirect_to(new_rails_conductor_inbound_email_path)
        else
          redirect_to(new_session_path, alert: "Please sign in to continue")
        end
      end
      format.any do
        render(json: { error: error.message }, status: :unauthorized)
      end
    end
  end

  sig { params(exception: Exception).void }
  def report_and_render_json_exception(exception)
    report_exception(exception)
    render_json_exception(exception)
  end

  sig { params(exception: Exception).void }
  def report_exception(exception)
    Rails.error.report(exception)
    Sentry.capture_exception(exception)
  end

  # == Rescue handlers
  sig { params(error: ActionPolicy::Unauthorized).void }
  def handle_unauthorized(error)
    if request.format.json?
      report_and_render_json_exception(error)
    else
      raise
    end
  end

  sig { params(exception: ActionController::InvalidAuthenticityToken).void }
  def handle_invalid_authenticity_token(exception)
    if request.inertia?
      flash.alert = "The page expired, please try again."
      inertia_location(start_path)
    elsif request.format.json?
      report_and_render_json_exception(exception)
    else
      raise
    end
  end

  sig { params(error: AuthenticationRequired).void }
  def handle_authentication_required(error)
    respond_to do |format|
      format.html do
        redirect_to(start_path, alert: "Please sign in to continue.")
      end
      format.any do
        render(json: { error: error.message }, status: :unauthorized)
      end
    end
  end
end
