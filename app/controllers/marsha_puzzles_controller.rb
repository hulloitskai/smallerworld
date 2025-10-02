# typed: true
# frozen_string_literal: true

class MarshaPuzzlesController < ApplicationController
  # GET /marsha_puzzles/:id
  def show
    id = params.fetch(:id)
    marshapuzzle_dir = Rails.root.join("app/assets/marshapuzzle")
    svg = marshapuzzle_dir.join("#{id}.svg").read
    offsets_raw = marshapuzzle_dir.join("#{id}.offsets.json").read
    offsets = JSON.parse(offsets_raw)
    render(inertia: "MarshaPuzzlePage", props: {
      "puzzleSvg" => svg,
      "hardcodedFillPatternOffsets" => offsets,
    })
  end
end
