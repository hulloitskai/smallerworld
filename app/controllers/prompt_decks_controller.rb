# typed: true
# frozen_string_literal: true

class PromptDecksController < ApplicationController
  # "GET /prompt_decks"
  def index
    respond_to do |format|
      format.json do
        decks = PromptDeck.all
        render(json: {
          decks: PromptDeckSerializer.many(decks),
        })
      end
    end
  end
end
