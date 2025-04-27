# typed: true
# frozen_string_literal: true

class PushSubscriptionsController < ApplicationController
  # == Actions
  # POST /push_subscriptions/lookup
  def lookup
    endpoint = params.dig(:push_subscription, :endpoint) or
      raise ActionController::ParameterMissing,
            "Missing push subscription endpoint"
    owner = current_friend || current_user
    registration = PushRegistration.joins(:push_subscription)
      .where(push_subscriptions: { endpoint: })
      .find_by(owner:)
    render(json: {
      registration: PushRegistrationSerializer.one_if(registration),
    })
  end

  # POST /push_subscriptions
  def create
    owner = current_friend || current_user
    subscription_params = params.expect(push_subscription: %i[
      endpoint
      p256dh_key
      auth_key
    ])
    registration_params = params.expect(push_registration: %i[
      device_id
      device_fingerprint
      device_fingerprint_confidence
    ])
    endpoint = subscription_params.delete(:endpoint) or
      raise ActionController::ParameterMissing,
            "Missingpush subscription endpoint"
    subscription = PushSubscription.find_or_initialize_by(endpoint:)
    subscription.attributes = subscription_params
    registration = subscription.registrations.find_or_initialize_by(owner:)
    registration.update!(registration_params)
    render(json: {
      registration: PushRegistrationSerializer.one(registration),
    })
  end

  # PUT /push_subscriptions/unsubscribe
  def unsubscribe
    subscription = find_subscription
    subscription.destroy!
    render(json: {})
  end

  # POST /push_subscriptions/change
  def change
    endpoint = params.dig(:old_subscription, :endpoint) or
      raise ActionController::ParameterMissing,
            "Missing old subscription endpoint"
    new_subscription_params = params.expect(new_subscription: %i[
      endpoint
      p256dh_key
      auth_key
    ])
    subscription = PushSubscription.find_by!(endpoint:)
    subscription.update!(new_subscription_params)
    render(json: {})
  end

  # POST /push_subscriptions/test
  def test
    subscription = find_subscription
    owner = current_friend || current_user
    registration = subscription.registrations.find_by!(owner:)
    registration.push_test_notification
    render(json: {})
  end

  # GET /push_subscriptions/public_key
  def public_key
    public_key = Rails.application.credentials.web_push!.public_key!
    render(json: {
      "publicKey" => encode_public_key(public_key),
    })
  end

  private

  # == Helpers
  sig { returns(PushSubscription) }
  def find_subscription
    endpoint = params[:endpoint] or
      raise ActionController::ParameterMissing, "Missing endpoint"
    PushSubscription.find_by!(endpoint:)
  end

  # See: https://fly.io/ruby-dispatch/push-to-subscribe/#user-interface
  sig { params(public_key: String).returns(String) }
  def encode_public_key(public_key)
    public_key.tr("_-", "/+")
  end
end
