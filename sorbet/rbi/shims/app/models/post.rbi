# typed: true
# frozen_string_literal: true

class Post < ApplicationRecord
  # == Types
  sig { returns(T::Boolean) }
  def journal_entry?; end

  sig { returns(T::Boolean) }
  def poem?; end

  sig { returns(T::Boolean) }
  def invitation?; end

  sig { returns(T::Boolean) }
  def question?; end

  sig { returns(T::Boolean) }
  def follow_up?; end
end
