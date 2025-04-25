# typed: true
# frozen_string_literal: true

class PushRegistration < ApplicationRecord
  sig { returns(T.nilable(T.all(ActiveRecord::Base, Notifiable))) }
  def owner; end

  sig do
    type_parameters(:U)
      .params(value: T.nilable(T.all(
        T.type_parameter(:U),
        ActiveRecord::Base,
        Notifiable,
      )))
      .void
  end
  def owner=(value); end
end
