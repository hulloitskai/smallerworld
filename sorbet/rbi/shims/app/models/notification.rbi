# typed: true
# frozen_string_literal: true

class Notification < ApplicationRecord
  sig { returns(T.nilable(T.all(ApplicationRecord, Notifiable))) }
  def recipient; end

  sig { params(value: T.nilable(T.all(ApplicationRecord, Notifiable))).void }
  def recipient=(value); end
end
