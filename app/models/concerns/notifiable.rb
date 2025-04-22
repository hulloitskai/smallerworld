# typed: strict
# frozen_string_literal: true

module Notifiable
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  abstract!
  requires_ancestor { ActiveRecord::Base }

  included do
    T.bind(self, T.class_of(ActiveRecord::Base))

    # == Associations
    has_many :push_registrations,
             as: :owner,
             dependent: :destroy
    has_many :push_subscriptions, through: :push_registrations
    has_many :received_notifications,
             class_name: "Notification",
             as: :recipient,
             dependent: :destroy

    # == Scopes
    scope :unnotifiable, -> {
      where.missing(:push_registrations)
    }

    scope :notifiable, -> {
      unnotifiable = T.let(public_send(:unnotifiable), ActiveRecord::Relation)
      where.not(id: unnotifiable.select(:id))
    }
  end

  # == Interface
  sig { abstract.returns(T.nilable(Time)) }
  def notifications_last_cleared_at; end

  sig { abstract.returns(Notification::PrivateCollectionProxy) }
  def received_notifications; end

  sig { abstract.returns(::PushRegistration::PrivateCollectionProxy) }
  def push_registrations; end

  # == Methods
  sig { returns(T::Boolean) }
  def notifiable?
    push_registrations.any?
  end

  sig { returns(T::Boolean) }
  def unnotifiable?
    push_registrations.none?
  end

  sig do
    returns(T.any(
      Notification::PrivateAssociationRelation,
      Notification::PrivateCollectionProxy,
    ))
  end
  def notifications_received_since_last_cleared
    if (last_cleared_at = notifications_last_cleared_at)
      received_notifications.where("created_at > ?", last_cleared_at)
    else
      received_notifications
    end
  end

  sig { void }
  def test_push_notifications
    push_registrations.find_each(&:push_test_notification)
  end
end
