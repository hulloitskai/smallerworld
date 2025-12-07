# typed: true
# frozen_string_literal: true

require "application_system_test_case"

class UniverseTest < ApplicationSystemTestCase
  # == Tests
  test "can see post text on universe page" do
    # Sign in as noposts (who is a friend in testy's world)
    noposts = users(:noposts)
    visit new_session_path

    phone = noposts.phone
    fill_in "country_code", with: phone.country_code
    fill_in "national_phone_number", with: phone.national(false)
    click_link_or_button "send login code"
    click_link_or_button "auto-fill code", wait: 4.seconds
    click_link_or_button "sign in", wait: 4.seconds

    # Assert on world page (sign-in complete)
    assert_current_path user_world_path(trailing_slash: true)

    # Navigate to universe page
    visit user_universe_path

    # Assert testy's post text is visible
    assert_text "This is a post with a title and an emoji."
  end
end
