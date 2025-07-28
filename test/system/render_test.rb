# typed: true
# frozen_string_literal: true

require "application_system_test_case"

class RenderTest < ApplicationSystemTestCase
  # == Tests
  test "renders landing page" do
    visit(root_url)
    assert_selector("#app")
    assert_not_empty(find_by_id("app").find_all("*"))
  end

  test "renders user page" do
    testy = users(:testy)
    visit user_url(testy)
    assert_selector "#app"
    assert_not_empty find_by_id("app").find_all("*")
  end
end
