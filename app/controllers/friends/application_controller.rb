# typed: true
# frozen_string_literal: true

module Friends
  class ApplicationController < ::ApplicationController
    # == Filters ==

    before_action :authenticate_friend!
  end
end
