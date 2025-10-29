import {
  ActionIcon,
  Alert,
  AppShell,
  Button,
  Chip,
  CloseButton,
  createTheme as createMantineTheme,
  DEFAULT_THEME,
  type DefaultMantineColor,
  Drawer,
  HoverCard,
  InputBase,
  InputWrapper,
  JsonInput,
  Loader,
  type MantineColorsTuple,
  type MantineThemeOverride,
  Menu,
  Modal,
  NavLink,
  NumberInput,
  Overlay,
  PasswordInput,
  PinInput,
  Popover,
  ScrollArea,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Typography,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { RichTextEditor } from "@mantine/tiptap";
import { type PopoverMiddlewares } from "node_modules/@mantine/core/lib/components/Popover/Popover.types";

import { type Rect, useSafeViewportRect } from "./safeArea";

import classes from "./mantine.module.css";
import "./mantine.css";

export type CustomColors = "primary" | "accent" | "rose" | DefaultMantineColor;

declare module "@mantine/core" {
  export interface MantineThemeColorsOverride {
    colors: Record<CustomColors, MantineColorsTuple>;
  }
}

const ROSE_COLORS: MantineColorsTuple = [
  "#fff1f2",
  "#ffe4e6",
  "#fecdd3",
  "#fda4af",
  "#fb7185",
  "#f43f5e",
  "#e11d48",
  "#be123c",
  "#9f1239",
  "#881337",
];

const createTheme = (
  safeViewportRect: Rect | undefined,
): MantineThemeOverride => {
  const floatingMiddlewares: PopoverMiddlewares = {
    shift: {
      rootBoundary: safeViewportRect,
    },
    flip: {
      rootBoundary: safeViewportRect,
    },
  };
  return createMantineTheme({
    autoContrast: true,
    cursorType: "pointer",
    colors: {
      rose: ROSE_COLORS,
      primary: ROSE_COLORS,
      accent: DEFAULT_THEME.colors.lime,
      resumeAccent: DEFAULT_THEME.colors.indigo,
    },
    primaryColor: "primary",
    defaultRadius: "lg",
    fontFamily:
      "Manrope Variable, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, " +
      "Arial, sans-serif",
    fontFamilyMonospace:
      "JetBrains Mono Variable, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, " +
      "Liberation Mono, Courier New, monospace",
    headings: {
      fontFamily:
        "Bricolage Grotesque Variable, Manrope Variable, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, " +
        "Arial, sans-serif",
    },
    focusClassName: cn("mantine-focus-auto", classes.focus),
    components: {
      ActionIcon: ActionIcon.extend({
        defaultProps: {
          variant: "subtle",
        },
      }),
      Alert: Alert.extend({
        styles: {
          title: {
            fontWeight: 800,
          },
        },
        classNames: {
          root: classes.alert,
          title: classes.alertTitle,
          body: classes.alertBody,
        },
      }),
      Badge: Badge.extend({
        defaultProps: {
          variant: "light",
        },
        classNames: {
          root: classes.badge,
          label: classes.badgeLabel,
        },
      }),
      Button: Button.extend({
        defaultProps: {
          variant: "light",
        },
        classNames: {
          root: classes.button,
          label: classes.buttonLabel,
        },
        styles: (_theme, { size = "sm" }) => ({
          root: {
            ...(!["xs", "compact-xs", "compact-sm"].includes(size) && {
              "--button-fw": 700,
            }),
          },
        }),
      }),
      Card: Card.extend({
        classNames: {
          root: classes.card,
          section: classes.cardSection,
        },
      }),
      Drawer: Drawer.extend({
        defaultProps: {
          position: "bottom",
        },
        classNames: {
          header: classes.drawerHeader,
        },
        styles: ({ headings: { sizes, ...style } }) => ({
          title: {
            ...sizes.h4,
            ...style,
          },
        }),
      }),
      Group: Group.extend({
        defaultProps: {
          wrap: "nowrap",
        },
      }),
      HoverCard: HoverCard.extend({
        classNames: {
          dropdown: classes.dropdown,
        },
      }),
      Loader: Loader.extend({
        defaultProps: {
          type: "dots",
          size: "sm",
          color: "primary.5",
        },
      }),
      Modal: Modal.extend({
        classNames: {
          root: classes.modal,
          header: classes.modalHeader,
          inner: classes.modalInner,
          content: classes.modalContent,
        },
        styles: ({ headings: { sizes, ...style } }) => ({
          title: {
            ...sizes.h4,
            ...style,
          },
        }),
      }),
      JsonInput: JsonInput.extend({
        classNames: {
          input: classes.input,
          label: classes.inputLabel,
        },
      }),
      Menu: Menu.extend({
        defaultProps: {
          withArrow: true,
        },
        classNames: {
          dropdown: classes.menuDropdown,
          arrow: classes.menuArrow,
          item: classes.menuItem,
          itemSection: classes.menuItemSection,
          itemLabel: classes.menuItemLabel,
          divider: classes.menuDivider,
        },
      }),
      NavLink: NavLink.extend({
        classNames: {
          root: classes.navLink,
        },
      }),
      NumberInput: NumberInput.extend({
        classNames: {
          input: classes.input,
          label: classes.inputLabel,
        },
      }),
      Overlay: Overlay.extend({
        defaultProps: {
          blur: 2,
        },
      }),
      Text: Text.extend({
        classNames: {
          root: classes.text,
        },
      }),
      TextInput: TextInput.extend({
        classNames: {
          input: classes.input,
          label: classes.inputLabel,
        },
      }),
      Textarea: Textarea.extend({
        classNames: {
          input: classes.input,
          label: classes.inputLabel,
        },
        styles: {
          input: {
            "--input-padding-y": "var(--input-padding-y-sm)",
          },
        },
      }),
      ThemeIcon: ThemeIcon.extend({
        defaultProps: {
          variant: "default",
        },
      }),
      Title: Title.extend({
        classNames: {
          root: classes.title,
        },
      }),
      PasswordInput: PasswordInput.extend({
        defaultProps: {
          variant: "filled",
        },
        classNames: {
          input: classes.input,
          label: classes.inputLabel,
        },
      }),
      Popover: Popover.extend({
        defaultProps: {
          withArrow: true,
          middlewares: floatingMiddlewares,
        },
        classNames: {
          dropdown: classes.popoverDropdown,
        },
      }),
      Tooltip: Tooltip.extend({
        defaultProps: {
          withArrow: true,
          middlewares: floatingMiddlewares,
        },
      }),
      InputBase: InputBase.extend({
        classNames: {
          input: classes.input,
          label: classes.inputLabel,
        },
      }),
      PinInput: PinInput.extend({
        classNames: {
          input: classes.input,
        },
      }),
      Typography: Typography.extend({
        classNames: {
          root: classes.typography,
        },
      }),
      CloseButton: CloseButton.extend({
        classNames: {
          root: classes.closeButton,
        },
      }),
      Divider: Divider.extend({
        classNames: {
          root: classes.divider,
          label: classes.dividerLabel,
        },
      }),
      DateInput: DateInput.extend({
        classNames: {
          input: classes.input,
          label: classes.inputLabel,
        },
      }),
      RichTextEditor: RichTextEditor.extend({
        classNames: {
          root: classes.input,
          content: classes.richTextEditorContent,
          control: classes.richTextEditorControl,
        },
      }),
      Chip: Chip.extend({
        defaultProps: {
          variant: "outline",
        },
      }),
      Checkbox: Checkbox.extend({
        classNames: {
          root: classes.checkbox,
        },
      }),
      Skeleton: Skeleton.extend({
        classNames: {
          root: classes.skeleton,
        },
      }),
      InputWrapper: InputWrapper.extend({
        classNames: {
          label: classes.inputLabel,
        },
      }),
      ScrollArea: ScrollArea.extend({
        defaultProps: {
          type: "auto",
        },
      }),
      AppShell: AppShell.extend({
        classNames: {
          footer: classes.appShellFooter,
        },
      }),
      Table: Table.extend({
        classNames: {
          table: classes.table,
        },
      }),
    },
  });
};

export const useCreateTheme = (): MantineThemeOverride => {
  const safeViewportRect = useSafeViewportRect();
  return useMemo(() => createTheme(safeViewportRect), [safeViewportRect]);
};

export const useAutoClearColorScheme = () => {
  const { clearColorScheme } = useMantineColorScheme();
  useEffect(() => {
    clearColorScheme();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};
