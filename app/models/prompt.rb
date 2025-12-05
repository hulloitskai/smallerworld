# typed: true
# frozen_string_literal: true

class Prompt < ApplicationFrozenRecord
  sig { returns(PromptDeck) }
  def deck
    PromptDeck.find(deck_id)
  end
end
