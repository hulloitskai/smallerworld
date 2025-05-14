# typed: true
# frozen_string_literal: true

class PushSubscriptionsController < ApplicationController
  # == Actions
  # POST /push_subscriptions/lookup
  def lookup
    owner = current_owner
    endpoint = params.dig(:subscription, :endpoint) or
      raise ActionController::ParameterMissing,
            "Missing push subscription endpoint"
    registration = PushRegistration.joins(:push_subscription)
      .where(push_subscriptions: { endpoint: })
      .find_by(owner:)
    render(json: {
      registration: PushRegistrationSerializer.one_if(registration),
    })
  end

  # POST /push_subscriptions
  def create
    owner = current_owner
    subscription_params = params.expect(subscription: %i[
      endpoint
      p256dh_key
      auth_key
    ])
    registration_params = params.expect(registration: %i[
      device_id
      device_fingerprint
      device_fingerprint_confidence
    ])
    endpoint = subscription_params.delete(:endpoint) or
      raise ActionController::ParameterMissing,
            "Missing push subscription endpoint"
    subscription = PushSubscription.find_or_initialize_by(endpoint:)
    subscription.attributes = subscription_params
    registration = subscription.registrations.find_or_initialize_by(owner:)
    registration.update!(registration_params)
    render(
      json: {
        registration: PushRegistrationSerializer.one(registration),
      },
      status: :created,
    )
  end

  # PUT /push_subscriptions/unsubscribe
  def unsubscribe
    owner = current_owner
    subscription = find_subscription
    should_remove_subscription = subscription.transaction do
      subscription.registrations.destroy_by(owner:)
      if subscription.registrations.none?
        subscription.destroy!
        true
      else
        false
      end
    end
    render(json: { "shouldRemoveSubscription" => should_remove_subscription })
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
    owner = current_owner
    subscription = find_subscription
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
    endpoint = params.dig(:subscription, :endpoint) or
      raise ActionController::ParameterMissing,
            "Missing push subscription endpoint"
    PushSubscription.find_by!(endpoint:)
  end

  sig { returns(T.nilable(T.any(Friend, User))) }
  def current_owner
    referrer = Addressable::URI.parse(request.referer)
    if referrer.path != universe_path
      current_friend || current_user
    end
  end

  # See: https://fly.io/ruby-dispatch/push-to-subscribe/#user-interface
  sig { params(public_key: String).returns(String) }
  def encode_public_key(public_key)
    public_key.tr("_-", "/+")
  end
end
