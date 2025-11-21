# typed: true
# frozen_string_literal: true

module Users::Worlds
  class EncouragementsController < ApplicationController
    # == Actions ==

    # GET /world/encouragements
    def index
      respond_to do |format|
        format.json do
          world = current_world!
          encouragements = world.encouragements_since_last_poem_or_journal_entry
          render(json: {
            encouragements: EncouragementSerializer.many(encouragements),
          })
        end
      end
    end
  end
end
