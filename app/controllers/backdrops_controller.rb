# typed: true
# frozen_string_literal: true

class BackdropsController < ApplicationController
  # == Actions
  # GET /backdrops/:id
  def show
    response.headers["Content-Type"] = "video/mp4"
    response.headers["Accept-Ranges"] = "bytes"
    backdrop_id = T.let(params.fetch(:id), String)
    backdrop_uri = Addressable::URI.parse(backdrop_origin_url(backdrop_id))
    Net::HTTP.start(
      backdrop_uri.host,
      backdrop_uri.port,
      use_ssl: backdrop_uri.scheme == "https",
    ) do |http|
      request = Net::HTTP::Get.new(backdrop_uri)
      http.request(request) do |s3_response|
        response.headers["Content-Length"] = s3_response["Content-Length"]
        s3_response.read_body do |chunk|
          response.stream.write(chunk)
        end
      end
    end
  ensure
    response.stream.close
  end

  private

  sig { params(id: String).returns(String) }
  def backdrop_origin_url(id)
    "https://assets.getpartiful.com/backgrounds/#{id}/web.mp4"
  end
end
