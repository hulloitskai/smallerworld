# typed: true
# frozen_string_literal: true

class PositionSerializer < ApplicationSerializer
  # == Attributes
  attributes x: { type: :number }, y: { type: :number }
end
