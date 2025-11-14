# typed: true
# frozen_string_literal: true

class WorldEncouragementsController < ApplicationController
  # == Filters ==

  before_action :authenticate_user!

  # == Actions ==

  # GET /world/encouragements
  def index
    respond_to do |format|
      format.json do
        user = authenticate_user!
        encouragements = user.encouragements_since_last_poem_or_journal_entry
        render(json: {
          encouragements: EncouragementSerializer.many(encouragements),
        })
      end
    end
  end
end
