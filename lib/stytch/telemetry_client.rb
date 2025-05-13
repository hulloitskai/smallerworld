# typed: true
# frozen_string_literal: true

module Stytch
  class TelemetryClient
    extend T::Sig
    extend T::Helpers

    sig { params(project_id: String, secret: String).void }
    def initialize(project_id:, secret:)
      @conn = T.let(
        Faraday.new("https://api.stytch.com") do |conn|
          conn.request(:authorization, :basic, project_id, secret)
          conn.request(:json)
          conn.response(:json)
        end,
        Faraday::Connection,
      )
    end

    sig { params(telemetry_id: String).returns(T.nilable(String)) }
    def lookup_device_fingerprint(telemetry_id:)
      response = @conn.get("/v1/fingerprint/lookup", telemetry_id:)
      if response.body.dig("verdict", "is_authentic_device")
        response.body.dig("fingerprints", "hardware_fingerprint")
      end
    end
  end
end
