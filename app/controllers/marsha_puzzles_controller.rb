# typed: true
# frozen_string_literal: true

class MarshaPuzzlesController < ApplicationController
  # == Rescuers
  rescue_from Errno::ENOENT, with: :handle_file_not_found

  # == Actions
  # GET /marsha_puzzles/:id
  def show
    # Allow iframe embedding
    response.headers["X-Frame-Options"] = "ALLOWALL"

    id = params.fetch(:id)
    marshapuzzle_dir = Rails.root.join("app/assets/marshapuzzle")
    svg = marshapuzzle_dir.join("#{id}.svg").read
    initializers_raw = marshapuzzle_dir.join("#{id}.initializers.json").read
    initializers = JSON.parse(initializers_raw)
    render(inertia: "MarshaPuzzlePage", props: {
      "puzzleSvg" => svg,
      "pathInitializers" => initializers,
    })
  end

  private

  # == Helpers
  sig { params(exception: Errno::ENOENT).void }
  def handle_file_not_found(exception)
    render(json: { error: "puzzle not found" }, status: :not_found)
  end
end
