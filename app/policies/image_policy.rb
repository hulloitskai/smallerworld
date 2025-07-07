# typed: true
# frozen_string_literal: true

class ImagePolicy < ApplicationPolicy
  # == Rules
  def download?
    image = T.let(record, Image)
    image.attachments.any? do |attachment|
      allowed_to?(:manage?, attachment.record)
    end
  end
end
