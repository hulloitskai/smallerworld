# typed: true
# frozen_string_literal: true

module RendersWorldThemes
  extend T::Sig
  extend T::Helpers
  extend ActiveSupport::Concern

  requires_ancestor { ActionController::Base }

  sig { params(args: T.untyped, kwargs: T.untyped).returns(T.untyped) }
  def render(*args, **kwargs)
    theme = if kwargs.key?(:world_theme)
      kwargs.delete(:world_theme)
    else
      kwargs.delete(:user_theme)
    end
    if theme
      color_scheme = World::DARK_THEMES.include?(theme) ? "dark" : "light"
      @root_attributes = {
        "data-mantine-color-scheme" => color_scheme,
        "data-world-theme" => theme
      }
    end
    super
  end
end
