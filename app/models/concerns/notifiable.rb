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
end
