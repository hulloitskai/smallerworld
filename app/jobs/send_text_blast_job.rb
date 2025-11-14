# typed: strict
# frozen_string_literal: true

class SendTextBlastJob < ApplicationJob
  # == Configuration ==

  good_job_control_concurrency_with(
    key: -> {
      T.bind(self, SendTextBlastJob)
      text_blast, = arguments
      "#{self.class.name}(#{text_blast.to_gid})"
    },
    total_limit: 1,
  )

  # == Job ==

  sig { params(text_blast: TextBlast).void }
  def perform(text_blast)
    text_blast.send_now
  end
end
