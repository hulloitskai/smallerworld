# typed: true
# frozen_string_literal: true

class EncouragementsController < ApplicationController
  # == Filters
  before_action :authenticate_user!, only: :index
  before_action :authenticate_friend!, only: :create

  # == Actions
  # GET /encouragements
  def index
    user = authenticate_user!
    encouragements = user.encouragements_since_last_post
    render(json: {
      encouragements: EncouragementSerializer.many(encouragements),
    })
  end

  # POST /encouragements?friend_token=...
  def create
    current_friend = authenticate_friend!
    encouragement_params = params.expect(encouragement: %i[emoji message])
    encouragement = current_friend.encouragements.build(
      **encouragement_params,
    )
    if encouragement.save
      render(
        json: {
          encouragement: EncouragementSerializer.one(encouragement),
        },
        status: :created,
      )
    else
      render(
        json: { errors: encouragement.form_errors },
        status: :unprocessable_entity,
      )
    end
  end
end
