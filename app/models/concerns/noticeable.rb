# typed: strict
# frozen_string_literal: true

module Noticeable
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  abstract!
  requires_ancestor { ActiveRecord::Base }

  # == Type aliases
  NotificationRecipient = T.type_alias { T.all(ApplicationRecord, Notifiable) }

  included do
    T.bind(self, T.class_of(ActiveRecord::Base))

    # == Associations
    has_many :notifications, as: :noticeable, dependent: :destroy
  end

  # == Interface
  sig do
    abstract
      .params(recipient: T.nilable(NotificationRecipient))
      .returns(NotificationMessage)
  end
  def notification_message(recipient:); end

  sig do
    overridable
      .params(recipient: T.nilable(NotificationRecipient))
      .returns(String)
  end
  def legacy_notification_type(recipient)
    model_name.name
  end

  sig do
    overridable
      .params(recipient: T.nilable(NotificationRecipient))
      .returns(T.nilable(T::Hash[String, T.untyped]))
  end
  def legacy_notification_payload(recipient); end
end
