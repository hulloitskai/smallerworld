# typed: true
# frozen_string_literal: true

class CannyController < ApplicationController
  # POST /canny/sso_token?friend_token=...
  def sso_token
    settings = Canny.settings or raise "Canny not configured"
    data = if (friend = current_friend)
      {
        "id" => friend.id,
        "email" => canny_email(friend),
        "name" => friend.fun_name,
      }
    elsif (user = current_user)
      {
        "id" => user.id,
        "email" => canny_email(user),
        "name" => user.name,
      }
    else
      raise "Missing friend or user"
    end
    token = JWT.encode(data, settings.private_key, "HS256")
    render(json: { "ssoToken" => token })
  end

  private

  # == Helpers
  sig { params(userlike: T.any(User, Friend)).returns(String) }
  def canny_email(userlike)
    "#{userlike.id}@#{userlike.model_name.plural}.smallerworld.club"
  end
end
