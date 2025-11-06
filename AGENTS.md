# Cursor Rules

## Do

- Use `mise exec -- …` for any Rails or Bundler command, and start scaffolding
  with `mise exec -- bin/rails generate …`.
- Run `bin/fix` before committing and keep diffs tightly focused on the
  requested change.
- Run `bin/test` for the code you touch (use targeted suites when obvious).
- Reset JS/TS tooling drift with `npm ci` and `mise install` whenever
  dependencies change.
- Call out which changes are yours versus pre-existing when summarizing work.
- Prefer straightforward implementations; only add abstractions or memoization
  after profiling shows a need.

## Don’t

- Introduce new dependencies or bypass hooks unless explicitly approved
  (`git push --no-verify` is only for dependency-audit failures).
- Remove existing logic without agreeing on scope and replacement.
- Skip regeneration steps when tooling already exists to recreate derived files.

## Commands

- `mise exec -- bin/rails generate …` — required path for new migrations,
  models, and similar scaffolds.
- `mise exec -- bin/rails db:migrate` — apply migrations with project-managed
  Ruby/Bundler versions.
- `bin/fix` — formatter/linter suite.
- `bin/test` — primary test runner.
- `npm ci` + `mise install` — align Node tooling when working on frontend
  dependencies.

## Regenerate Outputs

- After editing `config/routes.rb`, run\
  `mise exec -- bin/rails js_from_routes:generate JS_FROM_ROUTES_FORCE=1`.
- After editing serializers, run\
  `mise exec -- bin/rails types_from_serializers:generate TYPES_FROM_SERIALIZERS_FORCE=1`.

## Structure & References

- Frontend, TypeScript, and Rails model conventions: `app/AGENTS.md`.
- Supabase business-intelligence workflows: `docs/Business Intelligence.md`.
- Add nested `AGENTS.md` files in subdirectories that need overrides—the nearest
  file to the change takes precedence.

## Generated Outputs

- `typings/generated/auto-import.d.ts`
- `app/helpers/routes/generated/**/*.ts`
- `db/schema.rb`
- `sorbet/rbi/dsl/**/*.rbi`
- Any path containing `generated` or marked as auto-generated

Prefer updating source configs (e.g., `vite.config.ts`, `config/routes.rb`,
migrations) and regenerating, but direct edits are acceptable when they’re the
safest, fastest fix.
