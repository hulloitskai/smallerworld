# typed: true
# frozen_string_literal: true

module RendersUserThemes
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  requires_ancestor { ActionController::Base }

  sig { params(args: T.untyped, kwargs: T.untyped).returns(T.untyped) }
  def render(*args, **kwargs)
    if (user_theme = kwargs.delete(:user_theme))
      color_scheme = User::DARK_THEMES.include?(user_theme) ? "dark" : "light"
      @root_attributes = {
        "data-mantine-color-scheme" => color_scheme,
        "data-user-theme" => user_theme,
      }
    end
    super
  end
end
