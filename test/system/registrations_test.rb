# typed: true
# frozen_string_literal: true

require "application_system_test_case"

class RegistrationsTest < ApplicationSystemTestCase
  # == Tests
  test "can create an account" do
    # Sign in
    visit new_session_url
    fill_in "phone_number_without_country_code", with: "4167005432"
    click_link_or_button "send login code"
    click_link_or_button "auto-fill code", wait: 4.seconds
    click_link_or_button "sign in"

    # Assert on registration page
    assert_current_path new_registration_path

    # Fill in the name field
    fill_in "name", with: "Test"

    # Attach the file to the upload input
    attach_file(
      "your page icon",
      Rails.public_path.join("web-app-manifest-512x512.png"),
    )

    # Submit the form
    click_link_or_button "complete signup"

    # Wait for redirection to world_path
    assert_current_path world_path, wait: 15.seconds

    # Assert welcome post visible
    assert_text "welcome to my smaller world!"
  end
end
