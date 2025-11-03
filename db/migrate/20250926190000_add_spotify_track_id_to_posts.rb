# typed: true
# frozen_string_literal: true

class AddSpotifyTrackIdToPosts < ActiveRecord::Migration[8.0]
  def change
    add_column :posts, :spotify_track_id, :string
  end
end
