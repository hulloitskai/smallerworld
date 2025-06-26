# typed: true
# frozen_string_literal: true

class LandingController < ApplicationController
  # == Actions
  # GET /
  def show
    demo_user = load_demo_user(scope: User.with_page_icon)
    render(inertia: "LandingPage", props: {
      "demoUser" => UserSerializer.one_if(demo_user),
    })
  end

  private

  # == Helpers
  sig { params(scope: User::PrivateRelation).returns(T.nilable(User)) }
  def load_demo_user(scope: User.all)
    if (config = Rails.application.config_for(:landing)) &&
        (id = config[:demo_user])
      scope.with_page_icon.friendly.find(id)
    end
  end
end
