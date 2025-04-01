# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: post_alerts
#
#  id            :uuid             not null, primary key
#  message       :text             not null
#  scheduled_for :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  post_id       :uuid             not null
#
# Indexes
#
#  index_post_alerts_on_post_id  (post_id)
#
# Foreign Keys
#
#  fk_rails_...  (post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
class PostAlert < ApplicationRecord
  include Noticeable

  # == Associations
  belongs_to :post, inverse_of: :alerts

  sig { returns(Post) }
  def post!
    post or raise ActiveRecord::RecordNotFound, "Missing associated post"
  end

  # == Noticeable
  sig do
    override
      .params(recipient: T.all(ActiveRecord::Base, Notifiable))
      .returns(T::Hash[String, T.untyped])
  end
  def notification_payload(recipient)
    payload = PostAlertNotificationPayload.new(
      post_alert: self,
      friend_access_token: (recipient.access_token if recipient.is_a?(Friend)),
    )
    PostAlertNotificationPayloadSerializer.one(payload)
  end
end
