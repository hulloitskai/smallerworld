# typed: true
# frozen_string_literal: true

class PromptDeck < ApplicationFrozenRecord
  def self.kept
    where.not(deleted: true)
  end
end
