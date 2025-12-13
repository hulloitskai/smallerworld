# typed: true
# frozen_string_literal: true

class ErrorsController < ApplicationController
  # == Actions ==

  # GET /404
  def not_found
    respond_to do |format|
      format.html do
        render_error_page(
          status: :not_found,
          title: "page not found",
          description: "the page you were looking for doesn't exist!",
        )
      end
      format.json do
        render_json_error(status: :not_found, message: "page not found")
      end
    end
  end

  # GET /500
  def internal_server_error
    respond_to do |format|
      format.html do
        render_error_page(
          status: :internal_server_error,
          title: "internal error",
          description:
            "sorry about this, but something went wrong while processing " \
            "your request! our team has been notified.",
          error: exception,
        )
      end
      format.json do
        render_json_error(
          status: :internal_server_error,
          message: "internal error",
        )
      end
    end
  end

  # GET /422
  def unprocessable_content
    respond_to do |format|
      format.html do
        render_error_page(
          status: :unprocessable_content,
          title: "change rejected",
          description:
            "the change you wanted was rejected. maybe you tried to change " \
            "something you didn't have access to?",
          error: exception,
        )
      end
      format.json do
        render_json_error(
          status: :unprocessable_content,
          message: "change rejected",
        )
      end
    end
  end

  # GET /401
  def unauthorized
    respond_to do |format|
      format.html do
        render_error_page(
          status: :unauthorized,
          title: "unauthorized",
          description:
            "you're not allowed to access this resource or perform this " \
            "action.",
        )
      end
      format.json do
        render_json_error(status: :unauthorized, message: "unauthorized")
      end
    end
  end

  private

  # == Helpers ==

  sig do
    params(
      status: Symbol,
      title: String,
      description: String,
      error: T.nilable(Exception),
    ).void
  end
  def render_error_page(status:, title:, description:, error: nil)
    code = Rack::Utils.status_code(status)
    respond_to do |format|
      format.html do
        render(
          inertia: "ErrorPage",
          props: {
            title:,
            description:,
            code:,
            error: error&.message
          },
          status:,
        )
      end
      format.json do
        render(
          json: {
            error: error&.message || title
          },
          status:,
        )
      end
      format.any do
        message = Rack::Utils::HTTP_STATUS_CODES[code]
        render(plain: message, status:)
      end
    end
  end

  sig { params(status: Symbol, message: String).void }
  def render_json_error(status:, message:)
    render(json: { error: message }, status:)
  end

  sig { returns(T.nilable(Exception)) }
  def exception
    request.env["action_dispatch.exception"]
  end
end
