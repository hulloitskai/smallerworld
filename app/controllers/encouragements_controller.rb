# typed: true
# frozen_string_literal: true

class EncouragementsController < ApplicationController
  # == Filters ==

  before_action :authenticate_friend!

  # POST /encouragements?friend_token=...
  def create
    respond_to do |format|
      format.json do
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
            status: :unprocessable_content,
          )
        end
      end
    end
  end
end
