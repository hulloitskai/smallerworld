# typed: true
# frozen_string_literal: true

require "addressable/uri"

class SpotifyService < ApplicationService
  extend T::Sig

  # == Constants
  SPOTIFY_TRACK_ID_PATTERN = /\A[0-9A-Za-z]{22}\z/

  # == Methods
  sig { params(url: String).returns(String) }
  def self.track_id_from_url(url)
    extract_track_id(url) or raise "Invalid Spotify track URL"
  end

  private

  sig { params(url: String).returns(T.nilable(String)) }
  private_class_method def self.extract_track_id(url)
    stripped_url = url.strip
    return if stripped_url.empty?

    parse_spotify_uri(stripped_url) || parse_spotify_url(stripped_url)
  end

  sig { params(url: String).returns(T.nilable(String)) }
  private_class_method def self.parse_spotify_uri(url)
    return unless url.start_with?("spotify:track:")

    candidate = url.split(":").last
    validate_track_id(candidate)
  end

  sig { params(url: String).returns(T.nilable(String)) }
  private_class_method def self.parse_spotify_url(url)
    uri = Addressable::URI.parse(url)
    host = uri.host&.downcase
    return unless host&.include?("spotify.")

    segments = uri
      .path
      .to_s
      .split("/")
      .compact_blank
    track_index = segments.index("track")
    if track_index && segments[track_index + 1]
      return validate_track_id(clean_segment(segments[track_index + 1]))
    end

    first_segment = segments.first
    if first_segment&.start_with?("track")
      possible =
        first_segment.split(":").last || segments.second
      return validate_track_id(clean_segment(possible))
    end

    nil
  rescue Addressable::URI::InvalidURIError
    nil
  end

  sig { params(segment: T.nilable(String)).returns(T.nilable(String)) }
  private_class_method def self.clean_segment(segment)
    return unless segment

    segment
      .split("?").first
      &.split("#")&.first
  end

  sig { params(candidate: T.nilable(String)).returns(T.nilable(String)) }
  private_class_method def self.validate_track_id(candidate)
    value = candidate.to_s.strip
    return if value.empty?
    return value if value.match?(SPOTIFY_TRACK_ID_PATTERN)

    nil
  end
end
