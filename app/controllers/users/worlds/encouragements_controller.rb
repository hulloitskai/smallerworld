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
            encouragements: EncouragementSerializer.many(encouragements)
          })
        end
      end
    end

    # GET /encouragements/:id
    def show
      respond_to do |format|
        format.json do
          encouragement = find_encouragement!
          authorize!(encouragement)
          render(json: {
            encouragement: EncouragementSerializer.one(encouragement)
          })
        end
      end
    end

    private

    # == Helpers ==

    sig do
      params(scope: Encouragement::PrivateRelation).returns(Encouragement)
    end
    def find_encouragement!(scope: Encouragement.all)
      scope.find(params.fetch(:id))
    end
  end
end
