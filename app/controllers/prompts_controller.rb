# typed: true
# frozen_string_literal: true

class PromptsController < ApplicationController
  # GET /prompt_decks/:prompt_deck_id/prompts
  def index
    respond_to do |format|
      format.json do
        deck = find_deck!
        prompts = Prompt.where(deck_id: deck.id)
        render(json: {
          prompts: PromptSerializer.many(prompts),
        })
      end
    end
  end

  private

  # == Helpers ==

  sig { returns(PromptDeck) }
  def find_deck!
    PromptDeck.find(params.fetch(:prompt_deck_id))
  end
end
