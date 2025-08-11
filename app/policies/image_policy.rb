# typed: true
# frozen_string_literal: true

class ImagePolicy < ApplicationPolicy
  # == Rules
  def show?
    image = T.let(record, Image)
    image.attachments.any? do |attachment|
      allowed_to?(:show?, attachment.record)
    end
  end

  alias_method :download?, :show?
end
