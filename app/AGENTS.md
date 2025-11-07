# App Directory Guidance

## Scope

- Applies to work inside `app/components`, `app/pages`, `app/helpers`,
  `app/entrypoints`, `app/types`, `app/models`, and other shared frontend/Rails
  directories under `app/`.
- Add more granular `AGENTS.md` files inside subfolders when a sub-area needs
  overrides.

## Do

- Keep component logic straightforward; reach for `useMemo`/`useCallback` only
  when profiling shows a benefit.
- Declare every function (including exports) as an arrow expression, e.g.,
  `const fn = () => {}`.
- Assert guaranteed array access with `arr[index]!` so TypeScript understands
  the invariant.
- Check the auto-import definitions in `typings/generated/auto-imports.d.ts`
  before adding manual imports.
- Build pages with `PageComponent<Props>` and extend `SharedPageProps` when
  relevant.
- Lean on existing helpers for routing, data fetching, PWA scope, and real-time
  features instead of rolling custom utilities.

## Don’t

- Bypass shared helpers (routes, requests, links, etc.) when an existing wrapper
  already handles the pattern.
- Leave event handlers with non-descriptive parameters—avoid single-letter
  variables like `e`.

## Commands

- After changing models or scopes under `app/models`, run\
  `mise exec -- bin/tapioca dsl` to refresh Sorbet RBI files. Rerun outside the
  sandbox if it fails due to missing DB access.

## Component & Page Pattern

```tsx
import { Button } from "@mantine/core";
import IconName from "~icons/heroicons/icon-name-20-solid";
import { type ComponentProps } from "~/types";
import classes from "./ComponentName.module.css";

export interface ComponentNameProps {
  // props
}

const ComponentName: FC<ComponentNameProps> = ({ prop }) => {
  return <div className={classes.wrapper}>{prop}</div>;
};

ComponentName.layout = page => <SomeLayout>{page}</SomeLayout>;

export default ComponentName;
```

## Data Fetching & Mutations

```tsx
const { data, error, mutate } = useRouteSWR<ResponseType>(
  routes.endpoint.path(),
  {
    descriptor: "load user",
    keepPreviousData: true,
  },
);

const { trigger } = useRouteMutation<ResponseType>(routes.endpoint.path(), {
  descriptor: "create post",
});
```

- Choose user-friendly `descriptor` strings—they appear in logs _and_ in error
  toasts (e.g., `"failed to load user"`), so they should read well in both
  contexts.

## Navigation & PWA

- Use `const { url: pageUrl } = usePage();` inside pages; helpers can reference
  `url` when the context is singular.
- Preserve `pwa_scope` and related params on redirects
  (`queryParamsFromPath(pageUrl)` helps when passing `{ query }`).
- Prefer `PWAScopedLink` for internal navigation so users stay inside the
  correct scope.
- Treat `result.browser.is("Chrome") || result.os.is("Android")` as PWA-install
  capable—Android devices may not present as Chrome.

## Icons

- Import icons from the `~icons/...` alias (e.g.,
  `~icons/heroicons/heart-20-solid`) so we benefit from tree-shaking and
  consistent bundles; avoid package-level wildcard imports.
- Match the size suffix on the icon (`-20-`, `-24-`, etc.) to the Mantine
  component you’re rendering it in—`ActionIcon` instances should typically use
  the 20px variants we already rely on.
- Slot icons through Mantine props like `leftSection`, `rightSection`, or inside
  `ActionIcon` instead of applying custom wrappers—Mantine handles spacing,
  focus, and colors for us.

## Auth & Real-Time Hooks

- `useCurrentUser()` and `useCurrentFriend()` expose the two authentication
  paths.
- For live updates, use `useSubscription` for ActionCable, `useWebPush` for
  notifications, and rely on SWR’s focus revalidation instead of manual
  refreshes.

## Naming Conventions

- Prefer descriptive callback parameters. Example:\
  `onClick={(event) => { event.preventDefault(); /* … */ }}`
