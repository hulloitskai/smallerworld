# Cursor Rules

## Essential Commands

- Format and lint with `bin/fix` before committing; it installs tooling with the project's versions.
- Reset JS/TS tooling drift by running `npm ci` and matching the Node version defined in `mise.toml` (run `mise install`).
- Execute the full test suite with `bin/test`; do not call Rails test runners directly.
- If the pre-push hook fails because of a failed dependency audit, push with `git push --no-verify`.

## Change Management

- Default to the simplest implementation—only introduce abstractions or memoization when profiling proves the need.
- When cleaning code, separate existing logic from your additions and confirm scope before removing anything.
- Highlight which changes are new versus pre-existing when summarizing work.

## Generated Assets (Hands Off)

- `typings/generated/auto-import.d.ts`
- `app/helpers/routes/generated/**/*.ts`
- `db/schema.rb`
- `sorbet/rbi/dsl/**/*.rbi`
- Any path containing `generated` or marked as auto-generated

Update the source configs instead of editing these outputs (e.g., adjust auto-imports via `vite.config.ts`, routing via `config/routes.rb`, and database changes via migrations).

## Sub-Guides

- Detailed frontend, TypeScript, and Rails model instructions live in `app/AGENTS.md`.
- Create additional `AGENTS.md` files inside subdirectories that need their own rules; agents read the nearest guide.
