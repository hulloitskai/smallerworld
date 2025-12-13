# typed: true
# frozen_string_literal: true

class ZeffyService < ApplicationService
  # == Configuration ==

  sig { override.returns(T::Boolean) }
  def self.enabled?
    return false unless credentials_available?

    credentials = credentials!
    credentials.access_token.present? &&
      credentials.ticketing_id.present?
  end

  # == Initialization ==

  sig { void }
  def initialize
    super
    @conn = Faraday.new("https://api.zeffy.com") do |f|
      f.response(:logger, Rails.logger, bodies: true, errors: true)
      f.request(:json)
      f.response(:json)
    end
  end

  sig { returns(Faraday::Connection) }
  attr_reader :conn

  # == Methods ==

  sig { returns(T::Array[T::Hash[String, T.untyped]]) }
  def self.list_pending_guests
    credentials = credentials!
    input = {
      "ticketingId" => credentials.ticketing_id!,
      "occurrenceIds" => [],
      "filters" => {
        "searchFilter" => "",
        "statusFilter" => [ "notCheckedIn" ],
        "rateFilter" => [],
        "answerFilter" => []
      },
      "locale" => "EN",
      "cursor" => 0
    }
    response = instance.conn.get(
      "/_new/trpc/getCampaignGuestListPagedTableData",
      { "input" => JSON.dump(input) },
      { "Cookie" => cookie_header! },
    )
    if (error = response.body.dig("error", "message"))
      raise error
    end

    response.body.dig("result", "data", "items")
  end

  sig { params(guest_id: String).returns(T::Boolean) }
  def self.check_in_guest(guest_id)
    credentials = credentials!
    response = instance.conn.post(
      "/_new/trpc/markGuestAsCheckedIn",
      {
        "ticketingId" => credentials.ticketing_id!,
        "productTicketId" => guest_id
      },
      { "Cookie" => cookie_header! },
    )
    if (error = response.body.dig("error", "message"))
      raise error
    end

    response.body.dig("result", "data", "data")
  end

  # == Helpers ==

  sig { returns(T::Boolean) }
  def self.credentials_available?
    Rails.application.credentials.zeffy.present?
  end

  sig { returns(T.untyped) }
  def self.credentials!
    Rails.application.credentials.zeffy!
  end

  sig { returns(String) }
  private_class_method def self.cookie_header!
    @cookie_header ||= scoped do
      access_token = credentials!.access_token!
      cookie = HTTP::Cookie.new("accessToken", access_token)
      cookie.to_s
    end
  end
end
