# typed: true
# frozen_string_literal: true

class ActivitySerializer < ApplicationSerializer
  # == Attributes
  identifier
  attributes :name, :emoji, :description, :location_name, :template_id
end
