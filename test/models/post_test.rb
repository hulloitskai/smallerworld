# typed: true
# frozen_string_literal: true

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
