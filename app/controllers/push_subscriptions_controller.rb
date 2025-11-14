# typed: true
# frozen_string_literal: true

class PushSubscriptionsController < ApplicationController
  # == Actions ==

  # POST /push_subscriptions/lookup
  def lookup
    respond_to do |format|
      format.json do
        owner = current_owner
        endpoint = params.dig(:push_subscription, :endpoint) or
          raise ActionController::ParameterMissing,
                "Missing push subscription endpoint"
        registration = PushRegistration.joins(:push_subscription)
          .where(push_subscriptions: { endpoint: })
          .find_by(owner:)
        render(json: {
          "pushRegistration" => PushRegistrationSerializer.one_if(registration),
        })
      end
    end
  end

  # POST /push_subscriptions
  def create
    respond_to do |format|
      format.json do
        owner = current_owner
        subscription_params = params.expect(push_subscription: %i[
          endpoint
          p256dh_key
          auth_key
          service_worker_version
        ])
        registration_params = params.expect(push_registration: %i[
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
        registration.transaction do
          registration.update!(registration_params)
          subscription.save! if subscription.changed?
        end
        render(
          json: {
            "pushRegistration" => PushRegistrationSerializer.one(registration),
          },
          status: :created,
        )
      end
    end
  end

  # PUT /push_subscriptions/unsubscribe
  def unsubscribe
    respond_to do |format|
      format.json do
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
        render(json: {
          "shouldRemoveSubscription" => should_remove_subscription,
        })
      end
    end
  end

  # POST /push_subscriptions/change
  def change
    respond_to do |format|
      format.json do
        endpoint = params.dig(:old_push_subscription, :endpoint) or
          raise ActionController::ParameterMissing,
                "Missing old subscription endpoint"
        new_subscription_params = params.expect(new_push_subscription: %i[
          endpoint
          p256dh_key
          auth_key
        ])
        subscription = PushSubscription.find_by!(endpoint:)
        subscription.update!(new_subscription_params)
        render(json: {})
      end
    end
  end

  # POST /push_subscriptions/test
  def test
    respond_to do |format|
      format.json do
        owner = current_owner
        subscription = find_subscription
        registration = subscription.registrations.find_by!(owner:)
        registration.push_test_notification
        render(json: {})
      end
    end
  end

  # GET /push_subscriptions/public_key
  def public_key
    respond_to do |format|
      format.json do
        public_key = web_push_credentials!.public_key!
        render(json: {
          "publicKey" => encode_public_key(public_key),
        })
      end
    end
  end

  private

  # == Helpers ==

  sig do
    params(scope: PushSubscription::PrivateRelation).returns(PushSubscription)
  end
  def find_subscription(scope: PushSubscription.all)
    endpoint = params.require(:push_subscription).fetch(:endpoint)
    scope.find_by!(endpoint:)
  end

  sig { returns(T.nilable(T.any(Friend, User))) }
  def current_owner
    current_friend || current_user
  end

  # See: https://fly.io/ruby-dispatch/push-to-subscribe/#user-interface
  sig { params(public_key: String).returns(String) }
  def encode_public_key(public_key)
    public_key.tr("_-", "/+")
  end

  sig { returns(T.untyped) }
  def web_push_credentials!
    Rails.application.credentials.web_push!
  end
end
