# typed: strict
# frozen_string_literal: true

class ApiController < ApplicationController
  include ApiAuthentication

  # == Configuration
  protect_from_forgery with: :null_session
end
