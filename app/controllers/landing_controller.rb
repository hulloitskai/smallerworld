# typed: true
# frozen_string_literal: true

class LandingController < ApplicationController
  # == Actions
  # GET /
  def show
    render(inertia: "LandingPage", props: {
      "demoUser" => UserSerializer.one_if(demo_user),
    })
  end

  private

  # == Helpers
  sig { returns(T.nilable(User)) }
  def demo_user
    if (config = Rails.application.config_for(:landing)) &&
        (id = config[:demo_user])
      User.friendly.find(id)
    end
  end
end
