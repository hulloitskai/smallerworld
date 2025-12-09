# typed: true
# frozen_string_literal: true

require "application_system_test_case"

class SpacesTest < ApplicationSystemTestCase
  # == Tests
  test "spaces index page loads" do
    # Sign in as testy
    testy = users(:testy)
    visit new_session_path

    phone = testy.phone
    fill_in "country_code", with: phone.country_code
    fill_in "national_phone_number", with: phone.national(false)
    click_link_or_button "send login code"
    click_link_or_button "auto-fill code", wait: 4.seconds
    click_link_or_button "sign in", wait: 4.seconds

    # Assert on world page (sign-in complete)
    assert_current_path user_world_path

    # Navigate to spaces index
    visit user_spaces_path

    # Assert page loaded (spaces header visible)
    assert_text "spaces"
  end

  test "space page loads" do
    space = spaces(:testy_space)

    # Visit the space page directly (no auth required)
    visit space_path(space)

    # Assert space name is visible
    assert_text space.name
  end
end
