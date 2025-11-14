# typed: strict
# frozen_string_literal: true

module Noticeable
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  abstract!
  requires_ancestor { ActiveRecord::Base }

  # == Type Aliases ==

  included do
    T.bind(self, T.class_of(ActiveRecord::Base))

    # == Associations ==

    has_many :notifications, as: :noticeable, dependent: :destroy
  end

  # == Interface ==

  sig { abstract.params(recipient: Notifiable).returns(NotificationMessage) }
  def notification_message(recipient:); end
end
