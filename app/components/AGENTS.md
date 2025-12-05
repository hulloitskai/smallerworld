# Component Development Guide

## Scope

Applies to all components in `app/components`. This directory contains reusable
UI components built on Mantine Core with TypeScript and CSS Modules.

## File Structure

### Organization

- **Flat structure**: All components live directly in `app/components/`—no
  subdirectory nesting.
- **Component + CSS**: Each component has a `.tsx` file and optional
  `.module.css` file in the same directory.
  - Example: `PostCard.tsx` + `PostCard.module.css`
- **Internal helpers**: Define helper components after the main export in the
  same file—do not export them or create separate files.

### Naming Conventions

- Component files: `PascalCase.tsx` (e.g., `PostCard.tsx`,
  `UserWorldFriendCard.tsx`)
- CSS modules: `PascalCase.module.css` (e.g., `PostCard.module.css`)
- CSS class names: `camelCase` (e.g., `.card`, `.encouragementBadge`,
  `.typeIcon`)

## Props Interface

### Structure Pattern

```typescript
export interface ComponentNameProps extends BoxProps {
  // Required props first
  post: Post;
  actions: ReactNode;

  // Optional props after
  blurContent?: boolean;
  hideEncouragement?: boolean;

  // Callbacks with descriptive names
  onPostUpdated?: (post: Post) => void;
  onClose?: () => void;
}
```

### Rules

- **Always export** the props interface: `export interface ComponentNameProps`
- **Required props first**, then optional props
- **Extend Mantine component props** to inherit layout/styling capabilities:
  - Most common: `extends BoxProps` for flexible layout
  - Cards: `extends Omit<CardProps, "children">` to inherit all Card props
    except children
  - Buttons: `extends ButtonProps` or
    `Pick<ButtonProps, "loading" | "disabled">`
- **Use Pick** to select specific inherited props when needed:
  `Pick<ButtonProps, "loading">`
- **Use Omit** to exclude props:
  `Omit<ComponentPropsWithoutRef<"div">, "style">`
- **Callbacks return void**: `onChange?: (value: Upload | null) => void`
- **Destructure object params**:
  `onEmojiClick?: ({ emoji }: EmojiClickData) => void`
- **Include result in success callbacks**:
  `onSpaceCreated?: (space: Space) => void`

## Component Implementation

### Standard Pattern

```typescript
import { Button, Stack, Text } from "@mantine/core";
import DeleteIcon from "~icons/heroicons/trash-20-solid";
import { type Post } from "~/types";
import { prettyDate } from "~/helpers/dates";
import classes from "./ComponentName.module.css";

export interface ComponentNameProps extends BoxProps {
  post: Post;
  onPostUpdated?: (post: Post) => void;
}

const ComponentName: FC<ComponentNameProps> = ({
  post,
  onPostUpdated,
  className,
  ...otherProps
}) => {
  const [opened, setOpened] = useState(false);

  const handleUpdate = () => {
    // Logic here
    onPostUpdated?.(updatedPost);
  };

  return (
    <Stack className={cn("ComponentName", classes.container, className)} {...otherProps}>
      <Text>{post.title}</Text>
      <Button onClick={handleUpdate}>update</Button>
    </Stack>
  );
};

export default ComponentName;

// Internal helper (not exported)
interface HelperProps {
  value: string;
}

const Helper: FC<HelperProps> = ({ value }) => {
  return <Text>{value}</Text>;
};
```

### Key Patterns

- **Arrow function declaration**: `const ComponentName: FC<...> = () => { }`
- **Destructure props** with defaults and rest:
  `({ prop1, prop2 = "default", className, ...otherProps })`
- **Always spread otherProps**: Pass `{...otherProps}` to root element for
  flexibility
- **Extract className**: Destructure it separately to merge with component
  classes
- **Default export only**: `export default ComponentName;` (no named export for
  main component)
- **Internal components after main export**: Define helpers below, don't export
  them

## Import Order

Follow this strict ordering:

```typescript
// 1. Mantine components
import { Button, Text, Stack, Card } from "@mantine/core";
import { type ModalProps } from "@mantine/core"; // Types can be separate

// 2. External libraries
import { DateTime } from "luxon";
import { motion } from "framer-motion";

// 3. Icons (unplugin-icons)
import DeleteIcon from "~icons/heroicons/trash-20-solid";
import MenuIcon from "~icons/heroicons/bars-3-20-solid";

// 4. Helpers (absolute imports)
import { prettyFriendName } from "~/helpers/friends";
import { useWebPush } from "~/helpers/webPush";

// 5. Types (use `type` keyword)
import { type Post, type Activity } from "~/types";
import { type UserWorldFriendProfile } from "~/types/generated";

// 6. Local components (relative imports for same directory only)
import DeleteConfirmation from "./DeleteConfirmation";
import EmojiPopover from "./EmojiPopover";

// 7. CSS (always last)
import classes from "./ComponentName.module.css";
```

### Import Rules

- Use **`type` keyword** for type-only imports:
  `import { type Post } from "~/types"`
- Prefer **absolute imports** (`~/helpers/...`) over relative
  (`../../helpers/...`)
- Only use **relative imports for sibling components** in same directory
- Import **icons from `~icons/` alias** (unplugin-icons):
  `import Icon from "~icons/heroicons/trash-20-solid"`
- Match icon size suffix to usage: `-20-` for ActionIcon, `-24-` for larger
  components

## Styling with CSS Modules

### Basic Usage

```typescript
import classes from "./ComponentName.module.css";

<Card className={cn("ComponentName", classes.card, className)} />
```

### CSS Module Patterns

```css
/* Use camelCase for class names */
.card {
  border-radius: var(--mantine-radius-default);
  padding: var(--mantine-spacing-md);
}

/* Data attribute selectors for state */
.card {
  &[data-focus] {
    border-color: var(--mantine-color-primary-outline);
  }

  &[data-world-visibility="secret"] {
    background-color: alpha(var(--mantine-color-gray-5), 0.2);
  }
}

/* Project mixins */
.emoji {
  @mixin emoji;
  font-size: var(--mantine-font-size-lg);
}

/* Theme-specific styles */
@mixin dark {
  .card {
    background-color: var(--mantine-color-dark-6);
  }
}

@mixin light-world-theme {
  .card {
    background-color: var(--mantine-color-white);
  }
}

/* Target Mantine component internals */
:global(.mantine-Button-section) {
  &[data-position="left"] {
    margin-right: 4px;
  }
}
```

### Rules

- **Always use `cn()` utility** (classnames) for combining classes:
  `cn(classes.card, classes.active)`
- **Include semantic component name** as first className:
  `className={cn("PostCard", classes.container)}`
- **Extract and merge className prop**:
  ```typescript
  const Component = ({ className, ...props }) => (
    <div className={cn(classes.base, className)} {...props} />
  );
  ```
- **Use data attributes** for state-driven styles:
  `<Card mod={{ focus, "world-visibility": post.visibility }} />`
- **CSS custom properties** for dynamic values:
  `--mantine-color-text: var(--mantine-color-black)`
- **Avoid inline styles** unless values are truly dynamic (e.g.,
  `width: ${px}px`)

## Event Handlers

### Naming Conventions

```typescript
// Callback props (passed to component):
onPostUpdated?: (post: Post) => void;
onSpaceCreated?: (space: Space) => void;
onClose?: () => void;
onChange?: (value: Upload | null) => void;

// Internal handlers (inside component):
const handleChange = (value: Upload | null) => {
  onChange?.(value);
};

const handleDelete = async () => {
  await trigger();
  onPostDeleted?.();
};
```

### Patterns

- **Callback props**: Use `on[Event]` pattern (`onPostUpdated`, `onClose`)
- **Internal handlers**: Use `handle[Action]` pattern (`handleChange`,
  `handleSubmit`)
- **Optional chaining** for callbacks: `onSuccess?.(result)`
- **Void promises** when not handling them: `void mutateRoute(...)`,
  `void trigger()`
- **Type parameters** for event handlers:
  `onClick={(event: MouseEvent<HTMLButtonElement>) => { }}`

## State Management

### Common Patterns

```typescript
// Simple state
const [opened, setOpened] = useState(false);
const [loading, setLoading] = useState(false);

// Uncontrolled components (can be controlled externally)
const [resolvedValue, handleChange] = useUncontrolled({
  value,
  defaultValue,
  onChange,
});

// Form handling
const { getInputProps, submit, submitting, values } = useForm({
  action: routes.posts.create,
  descriptor: "create post",
  initialValues: { title: "", body: "" },
  transformValues: values => ({ post: values }),
  onSuccess: ({ result }) => {
    void mutateRoute(routes.posts.index);
    onPostCreated?.(result);
  },
});

// Mutations
const { trigger: deletePost, mutating: deletingPost } = useRouteMutation(
  routes.posts.destroy,
  {
    params: { id: post.id },
    descriptor: "delete post",
    onSuccess: () => {
      toast.success("post deleted");
      void mutateRoute(routes.posts.index);
      onPostDeleted?.();
    },
  },
);

// Data fetching
const { data: postsData } = useRouteSWR<{ posts: Post[] }>(routes.posts.index, {
  descriptor: "load posts",
});
const posts = postsData?.posts ?? [];
```

### Rules

- **Descriptive names** for boolean state: `opened`, `loading`, `submitting`
  (not `isOpen`, `isLoading`)
- **Use `descriptor`** in useForm/useRouteMutation—it appears in error toasts,
  so make it user-friendly: `"create post"`, `"remove friend"` (lowercase, no
  punctuation)
- **Call void on promises** when intentionally not handling them:
  `void mutateRoute(...)`
- **Chain success callbacks**: Call parent callback in onSuccess:
  `onPostCreated?.(result)`
- **Data fetching type**: Use object type `useRouteSWR<{ posts: Post[] }>`, not
  array type
- **Extract with nullish coalescing**: `const posts = postsData?.posts ?? []`

## Component Composition Patterns

### Modal/Drawer Pattern

```typescript
const [drawerOpened, setDrawerOpened] = useState(false);

return (
  <>
    <Button onClick={() => setDrawerOpened(true)}>open</Button>
    <DrawerModal
      opened={drawerOpened}
      onClose={() => setDrawerOpened(false)}
      title="edit post"
    >
      <PostForm post={post} onPostUpdated={() => setDrawerOpened(false)} />
    </DrawerModal>
  </>
);
```

### Render Props Pattern

```typescript
<EmojiPopover onEmojiClick={handleEmojiClick}>
  {({ open, opened }) => (
    <Button onClick={open} mod={{ opened }}>
      react
    </Button>
  )}
</EmojiPopover>
```

### Component as Prop

```typescript
<Image component={motion.div} />
<Text component="time" />
<Menu.Item component={Link} href={routes.posts.show.path({ id: post.id })} />
<Box component={DeleteIcon} fz="sm" />
```

## Mantine Integration

### Extending Mantine Props

```typescript
// Inherit all Box props for layout flexibility
export interface PostCardProps extends BoxProps {
  post: Post;
}

// Inherit all Card props except children
export interface CustomCardProps extends Omit<CardProps, "children"> {
  content: string;
}

// Button-like components
export interface DeleteButtonProps
  extends Pick<DeleteConfirmationProps, "onConfirm">,
    ButtonProps,
    Omit<ComponentPropsWithoutRef<"button">, "color" | "style"> {}
```

### Using Mantine Component Classes

```typescript
import { Drawer as MantineDrawer } from "@mantine/core";
import mantineClasses from "~/helpers/mantineClasses.module.css";

<Drawer
  classNames={{
    header: cn(
      MantineDrawer.classes.header,
      mantineClasses.drawerHeader,
      classes.header,
    ),
  }}
/>;
```

### Icon Integration

```typescript
// Import icon
import DeleteIcon from "~icons/heroicons/trash-20-solid";

// Use in Button sections
<Button leftSection={<DeleteIcon />}>delete</Button>

// Use as component
<Box component={DeleteIcon} fz="sm" c="dimmed" />

// In ActionIcon
<ActionIcon>
  <DeleteIcon />
</ActionIcon>
```

**Icon Rules:**

- Match icon size suffix (`-20-`, `-24-`) to component size
- ActionIcon typically uses `-20-` variants
- Use `leftSection`/`rightSection` props instead of custom wrappers
- Mantine handles spacing and colors automatically

## Anti-Patterns to Avoid

### ❌ Don't

```typescript
// Don't export internal helpers
export { PostCard, InternalHelper }; // BAD

// Don't omit className from destructuring
const Component = ({ ...props }) => <div {...props} />; // BAD - className gets buried

// Don't skip semantic component name
<Stack className={classes.container} />; // BAD

// Don't use inline styles for static values
<Box style={{ padding: "16px" }} />; // BAD - use CSS module

// Don't mix named and default exports for main component
export { Component };
export default Component; // BAD

// Don't use single-letter event handler params
onClick={(e) => {}}; // BAD - use descriptive name

// Don't forget to void unhandled promises
mutateRoute(routes.posts.index); // BAD - warns about unhandled promise

// Don't use array type for data fetching
const { data } = useRouteSWR<Post[]>(...); // BAD - use object type
```

### ✅ Do

```typescript
// Export only props interface and default component
export interface PostCardProps {}
const PostCard: FC<PostCardProps> = () => {};
export default PostCard;

// Extract className and merge with component classes
const Component = ({ className, ...props }) => (
  <div className={cn("Component", classes.base, className)} {...props} />
);

// Use CSS modules for styling
<Stack className={classes.container} />;

// Void unhandled promises explicitly
void mutateRoute(routes.posts.index);

// Use descriptive parameter names
onClick={(event) => {
  event.preventDefault();
}};

// Use object type for data fetching
const { data: postsData } = useRouteSWR<{ posts: Post[] }>(routes.posts.index, {
  descriptor: "load posts",
});
const posts = postsData?.posts ?? [];
```

## Constants and Configuration

```typescript
// Define at top of component file
const IMAGE_MAX_WIDTH = 340;
const IMAGE_MAX_HEIGHT = 280;
const PROMPT_CARD_WIDTH = 220;

const ComponentName: FC<Props> = () => {
  // Use constants
  return <Image maw={IMAGE_MAX_WIDTH} />;
};
```

## Summary Checklist

Before creating or modifying a component, ensure:

- [ ] Props interface exported with `export interface ComponentNameProps`
- [ ] Component uses default export: `export default ComponentName`
- [ ] Props extend relevant Mantine props (`BoxProps`,
      `Omit<CardProps, "children">`, etc.)
- [ ] Required props listed before optional props
- [ ] Callbacks typed with descriptive parameter names and `void` return
- [ ] `className` and `...otherProps` destructured and spread correctly
- [ ] Root element has semantic component name in className
- [ ] Import order follows standard (Mantine → icons → helpers → types → CSS)
- [ ] Type imports use `type` keyword
- [ ] CSS module uses camelCase class names
- [ ] Data attributes used for state-driven styling
- [ ] Internal helpers defined after main export, not exported separately
- [ ] Event handlers use descriptive names, not single letters
- [ ] Unhandled promises explicitly voided
- [ ] `descriptor` strings are user-friendly (appear in error toasts)
- [ ] Data fetching uses object type: `useRouteSWR<{ posts: Post[] }>`
