# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: sessions
#
#  id         :uuid             not null, primary key
#  ip_address :inet             not null
#  user_agent :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :uuid             not null
#
# Indexes
#
#  index_sessions_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class Session < ApplicationRecord
  # == Associations
  belongs_to :user

  sig { returns(User) }
  def user!
    user or raise ActiveRecord::RecordNotFound, "Missing associated user"
  end

  # == Validations
  validates :ip_address, :user_agent, presence: true
end
