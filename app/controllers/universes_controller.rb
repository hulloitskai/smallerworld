# typed: true
# frozen_string_literal: true

class UniversesController < ApplicationController
  # == Actions
  # GET /universe
  def show
    render(inertia: "UniversePage")
  end

  # GET /universe/worlds
  def worlds
    worlds = User
      .left_outer_joins(:posts)
      .group("users.id")
      .select(
        "users.*",
        "MAX(posts.created_at) as last_post_created_at",
        "COUNT(posts.id) as post_count",
      )
      .order("last_post_created_at DESC NULLS LAST")
    render(json: {
      worlds: WorldSerializer.many(worlds),
    })
  end
end
