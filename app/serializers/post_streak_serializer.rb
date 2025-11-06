# typed: true
# frozen_string_literal: true

class PostStreakSerializer < ApplicationSerializer
  attributes length: { type: :number },
             posted_today: { type: :boolean }
end
