# typed: strict
# frozen_string_literal: true

class CreatePostNotificationsJob < ApplicationJob
  # == Configuration
  good_job_control_concurrency_with(
    key: -> {
      T.bind(self, CreatePostNotificationsJob)
      post, = arguments
      "#{self.class.name}(#{post.to_gid})"
    },
    total_limit: 1,
  )

  # == Job
  sig { params(post: Post).void }
  def perform(post)
    post.create_notifications!
  end
end
