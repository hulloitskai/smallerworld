# postprint (Go)

A minimal Go CLI that prints Smaller World posts to PDF (and optionally to a
system printer) using Playwright/Chromium. It understands post URLs and space
URLs and will tail new posts for a space.

## Prerequisites

- Go via `mise` (e.g. `mise install go`)
- System printing tools (`lp`, `lpstat`) if you want to send to a printer
- Playwright will download Chromium on first run (cached under
  `~/Library/Caches/ms-playwright-go` or `~/.cache/ms-playwright-go`)

## Build

```bash
cd postprint
mise exec -- go build -o postprint
```

## Usage (interactive)

```bash
./postprint [--debug] [--local]
```

- You’ll first choose a mode:
  - “Watch a space (print new posts as they arrive)”
  - “Print a single post (by ID)”
- For a space, enter either:
  - The friendly ID (`some-name-abcdef0123456789abcdef0123456789`)
  - The raw UUID (with or without dashes)
  - The full space URL (uses its host; otherwise defaults to
    `https://smallerworld.club`)
- For a post, enter the post ID (posts don’t have public URLs).

Then you’ll pick how to output:

- Default: “Save to Downloads only” (always saves to `~/Downloads`)
- Or pick a printer from `lpstat -p` (PDF still saved to `~/Downloads`)

## Notes

- Hosts allowed: `smallerworld.club` or `localhost` (for local dev).
- Override the default base with `--local` (uses `http://localhost:3000` when
  the space input isn’t a URL).
- Printing uses `lp -o media=Custom.{width}x{height}mm -o fit-to-page` with
  dynamic dimensions derived from the rendered `.PostCard`.
- Space polling interval: 1s. It tracks seen post IDs and creation timestamps to
  avoid duplicates.
