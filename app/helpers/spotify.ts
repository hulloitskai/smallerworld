import { type ReactNode } from "react";

const SPOTIFY_TRACK_URL_PATTERN =
  /^https:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]+)(\?.*)?$/;

export const parseSpotifyTrackId = (trackUrl: string): string | null => {
  const matches = trackUrl.match(SPOTIFY_TRACK_URL_PATTERN);
  return matches?.[1] ?? null;
};

export const isValidSpotifyTrackUrl = (trackUrl: string): boolean =>
  SPOTIFY_TRACK_URL_PATTERN.test(trackUrl);

export const validateSpotifyTrackUrl = (trackUrl: string): ReactNode => {
  if (trackUrl && !isValidSpotifyTrackUrl(trackUrl)) {
    return "invalid Spotify track link";
  }
};
