# typed: true
# frozen_string_literal: true

require "application_system_test_case"

class PostingTest < ApplicationSystemTestCase
  # == Tests
  test "can post a journal entry" do
    # Sign in as Testy
    testy = users(:testy)
    visit new_session_path

    phone = testy.phone
    fill_in "country_code", with: phone.country_code
    fill_in "national_phone_number", with: phone.national(false)
    click_link_or_button "send login code"
    click_link_or_button "auto-fill code", wait: 4.seconds
    click_link_or_button "sign in", wait: 4.seconds

    # Assert on world page
    assert_current_path user_world_path

    # Click 'new post' button
    click_link_or_button "new post"

    # Click 'new journal entry' button
    click_link_or_button "new journal entry"

    # Fill in the contenteditable with test content
    find("[contenteditable='true']").set("this is a test journal entry")

    # Click 'post' button
    click_link_or_button "post"

    # Assert test post is visible
    assert_text "this is a test journal entry"
  end

  test "can post a journal entry in a space" do
    # Sign in as Testy
    testy = users(:testy)
    visit new_session_path

    phone = testy.phone
    fill_in "country_code", with: phone.country_code
    fill_in "national_phone_number", with: phone.national(false)
    click_link_or_button "send login code"
    click_link_or_button "auto-fill code", wait: 4.seconds
    click_link_or_button "sign in", wait: 4.seconds

    # Navigate to space page
    space = spaces(:testy_space)
    visit space_path(space)

    # Click 'new post' button
    click_link_or_button "new post"

    # Click 'new journal entry' button
    click_link_or_button "new journal entry"

    # Fill in the contenteditable with test content
    find("[contenteditable='true']").set("this is a test space journal entry")

    # Click 'post' button
    click_link_or_button "post"

    # Assert test post is visible
    assert_text "this is a test space journal entry"
  end
end
