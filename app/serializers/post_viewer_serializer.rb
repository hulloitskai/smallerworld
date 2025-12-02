# typed: true
# frozen_string_literal: true

class PostViewerSerializer < ApplicationSerializer
  # == Attributes ==

  identifier type: :string
  attribute :name, type: :string do
    viewer = post_viewer
    if viewer.is_a?(Friend)
      viewer.fun_name
    else
      viewer.name
    end
  end
end
