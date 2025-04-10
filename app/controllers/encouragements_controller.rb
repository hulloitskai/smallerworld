# typed: true
# frozen_string_literal: true

class EncouragementsController < ApplicationController
  # == Filters
  before_action :authenticate_friend!, only: :create

  # == Actions
  # POST /encouragements?friend_token=...
  def create
    current_friend = authenticate_friend!
    encouragement_params = params.expect(encouragement: %i[emoji message])
    encouragement = current_friend.encouragements.build(
      **encouragement_params,
    )
    if encouragement.save

    end
  end
end
