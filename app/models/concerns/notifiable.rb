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

    has_many :push_registrations,
             as: :owner,
             dependent: :destroy
    has_many :notifications, as: :recipient, dependent: :destroy
  end

  # == Interface
  sig { abstract.returns(T.nilable(Time)) }
  def notifications_last_cleared_at; end

  sig { abstract.returns(Notification::PrivateCollectionProxy) }
  def notifications; end

  # == Methods
  sig do
    returns(T.any(
      Notification::PrivateAssociationRelation,
      Notification::PrivateCollectionProxy,
    ))
  end
  def notifications_since_last_cleared
    if (last_cleared_at = notifications_last_cleared_at)
      notifications.where("created_at > ?", last_cleared_at)
    else
      notifications
    end
  end
end
