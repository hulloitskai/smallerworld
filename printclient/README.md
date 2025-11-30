# printclient

A simple Node.js CLI tool that tails recent posts from a SmallerWorld space and
prints new posts to stdout.

## Requirements

- Node.js 18+ (uses native fetch API)

## Usage

```bash
cd printclient
npm install
npm start -- <space-id>
```

### Example

```bash
npm start -- abc123
npm start -- abc123 --debug
```

## How It Works

1. On startup, fetches posts from
   `https://smallerworld.club/spaces/<space-id>/posts.json`
2. Records the ID of the most recent post (first in the array)
3. Polls the endpoint every 1 second
4. For any posts newer than the last recorded post, prints them to stdout
5. Updates the tracked post ID to the newest post

## Output Format

```
[<timestamp>] <author>: <content snippet>
```

## Graceful Shutdown

Press `Ctrl+C` to stop the client cleanly.
