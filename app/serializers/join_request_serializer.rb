# typed: true
# frozen_string_literal: true

class JoinRequestSerializer < ApplicationSerializer
  # == Attributes ==

  identifier
  attributes :name, :phone_number, :created_at
end
