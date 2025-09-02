# typed: true
# frozen_string_literal: true

module AuthenticatesUsers
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  include RendersJsonException

  requires_ancestor { ActionController::Base }

  # == Errors
  class NotAuthenticated < StandardError
    def initialize(message = "Not authenticated")
      super
    end
  end

  included do
    T.bind(self, T.class_of(ActionController::Base))

    # == Filters
    before_action :resume_session

    # == Exception handling
    rescue_from NotAuthenticated, with: :handle_not_authenticated
  end

  private

  # == Helpers
  sig { returns(T::Boolean) }
  def authenticated?
    !!resume_session
  end

  sig { returns(T.nilable(User)) }
  def current_user
    Current.user
  end

  sig { returns(User) }
  def authenticate_user!
    current_user or raise NotAuthenticated
  end

  sig { returns(T.nilable(Session)) }
  def find_session_by_cookie
    if (id = cookies.signed[:session_id])
      Session.with_user.merge(User.with_page_icon).find_by(id:)
    end
  end

  sig { returns(String) }
  def after_authentication_url
    session.delete(:return_to_after_authenticating) || world_path
  end

  sig { params(user: User).returns(Session) }
  def start_new_session_for!(user)
    user.sessions.create!(
      user_agent: request.user_agent,
      ip_address: request.remote_ip,
    ).tap do |session|
      Current.session = session
      cookies.signed.permanent[:session_id] =
        {
          value: session.id,
          httponly: true,
          same_site: nil,
          secure: Rails.env.production?,
        }
    end
  end

  sig { void }
  def terminate_session!
    Current.session&.destroy
    cookies.delete(:session_id)
  end

  sig { returns(T.nilable(String)) }
  def registration_token
    session[:registration_token]
  end

  sig { params(token: T.nilable(String)).returns(T.nilable(String)) }
  def registration_token=(token)
    if token.present?
      session[:registration_token] = token
    else
      session.delete(:registration_token)
    end
  end

  sig { returns(T::Boolean) }
  def valid_registration_token?
    registration_token = session[:registration_token] or return false
    LoginRequest
      .find_by_registration_token(registration_token)
      .present?
  end

  # == Filter handlers
  sig { returns(T.nilable(Session)) }
  def resume_session
    Current.session ||= find_session_by_cookie
  end

  # == Rescue handlers
  sig { params(error: NotAuthenticated).void }
  def handle_not_authenticated(error)
    respond_to do |format|
      format.html do
        session[:return_to_after_authenticating] = request.url
        redirect_to(new_session_path, alert: "please sign in to continue.")
      end
      format.json do
        render(json: { error: error.message }, status: :unauthorized)
      end
    end
  end
end
