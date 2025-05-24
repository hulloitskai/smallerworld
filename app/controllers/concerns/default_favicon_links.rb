# typed: true
# frozen_string_literal: true

module DefaultFaviconLinks
  DEFAULT_FAVICON_LINKS = [
    {
      "head-key" => "favicon",
      "rel" => "shortcut icon",
      "href" => "/favicon.ico",
    },
    {
      "head-key" => "favicon-image",
      "rel" => "icon",
      "type" => "image/png",
      "href" => "/favicon-96x96.png",
      "sizes" => "96x96",
    },
    {
      "head-key" => "apple-touch-icon",
      "rel" => "apple-touch-icon",
      "href" => "/apple-touch-icon.png",
    },
  ]
end
