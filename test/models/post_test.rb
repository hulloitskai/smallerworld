# typed: true
# frozen_string_literal: true

# rubocop:disable Layout/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: posts
#
#  id               :uuid             not null, primary key
#  body_html        :text             not null
#  emoji            :string
#  hidden_from_ids  :uuid             default([]), not null, is an Array
#  images_ids       :uuid             default([]), not null, is an Array
#  pinned_until     :datetime
#  title            :string
#  type             :string           not null
#  visibility       :string           not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  author_id        :uuid             not null
#  encouragement_id :uuid
#  quoted_post_id   :uuid
#
# Indexes
#
#  index_posts_for_search           ((((to_tsvector('simple'::regconfig, COALESCE((emoji)::text, ''::text)) || to_tsvector('simple'::regconfig, COALESCE((title)::text, ''::text))) || to_tsvector('simple'::regconfig, COALESCE(body_html, ''::text))))) USING gin
#  index_posts_on_author_id         (author_id)
#  index_posts_on_encouragement_id  (encouragement_id) UNIQUE
#  index_posts_on_hidden_from_ids   (hidden_from_ids) USING gin
#  index_posts_on_pinned_until      (pinned_until)
#  index_posts_on_quoted_post_id    (quoted_post_id)
#  index_posts_on_type              (type)
#  index_posts_on_visibility        (visibility)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#  fk_rails_...  (encouragement_id => encouragements.id)
#  fk_rails_...  (quoted_post_id => posts.id)
#
# rubocop:enable Layout/LineLength, Lint/RedundantCopDisableDirective
require "test_helper"

class PostTest < ActiveSupport::TestCase
  test "notification_message formats the message correctly with title and emoji" do
    post = posts(:post_with_title_and_emoji)
    message = post.notification_message(recipient: nil)
    expected_body = "👋 Hello World\n#{post.truncated_body_text}"
    assert_equal(expected_body, message.body)
  end

  test "notification_message formats the message correctly with emoji" do
    post = posts(:post_with_emoji)
    message = post.notification_message(recipient: nil)
    expected_body = "👋 #{post.truncated_body_text}"
    assert_equal(expected_body, message.body)
  end

  test "notification_message formats the message correctly with neither emoji nor title" do
    post = posts(:post_without_title_or_emoji)
    message = post.notification_message(recipient: nil)
    expected_body = post.truncated_body_text
    assert_equal(expected_body, message.body)
  end
end
