# typed: true
# frozen_string_literal: true

class PushRegistration < ApplicationRecord
  sig { returns(T.nilable(T.any(Friend, User))) }
  def recipient; end

  sig { params(value: T.nilable(T.any(Friend, User))).void }
  def recipient=(value); end
end
