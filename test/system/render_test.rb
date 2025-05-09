# typed: true
# frozen_string_literal: true

require "application_system_test_case"

class RenderTest < ApplicationSystemTestCase
  # == Configuration
  # driven_by :rack_test

  # == Tests
  test "renders landing page" do
    visit(root_path)
    assert_selector("#app")
    assert_not_empty(find_by_id("app").find_all("*"))
  end

  test "renders user page" do
    testy = user(:testy)
    visit(user_path(testy))
    assert_selector("#app")
    assert_not_empty(find_by_id("app").find_all("*"))
  end
end
