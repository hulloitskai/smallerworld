import { type InlinePreset } from "unimport";
import { type ImportsMap, type PresetName } from "unplugin-auto-import/types";

export const imports: (ImportsMap | PresetName | InlinePreset)[] = [
  // == Exports
  {
    "~/components": [
      "AnchorContainer",
      "EmptyCard",
      "Head",
      "Time",
      "TimeAgo",
      "PWAScopedLink",
    ],
    "~/components/icons": [
      "AddIcon",
      "RemoveIcon",
      "AlertIcon",
      "SuccessIcon",
      "CreateIcon",
      "DeleteIcon",
      "EditIcon",
      "OpenExternalIcon",
      "SaveIcon",
      "SearchIcon",
      "SettingsIcon",
      "UserIcon",
      "CouponIcon",
      "AuthenticateIcon",
      "ClipboardIcon",
      "SendIcon",
      "AdminIcon",
      "SignInIcon",
      "SignOutIcon",
      "NotificationIcon",
      "EmojiIcon",
      "FriendsIcon",
      "PhoneIcon",
      "ContinueIcon",
      "BackIcon",
      "InstallIcon",
      "RefreshIcon",
      "PublicIcon",
      "ChosenFamilyIcon",
      "JoinRequestsIcon",
      "CancelIcon",
      "CopyIcon",
      "CopiedIcon",
      "InstructionsIcon",
      "ReplyIcon",
    ],
    "~/helpers/actioncable/subscription": ["useSubscription"],
    "~/helpers/authentication": ["useCurrentUser", "useCurrentFriend"],
    "~/helpers/inertia/page": ["usePage", "usePageProps"],
    "~/helpers/inertia/routing": ["useQueryParams"],
    "~/helpers/json": ["formatJSON"],
    "~/helpers/meta": ["env", "getMeta", "requireMeta", "useEnv"],
    "~/helpers/pwa": ["usePWA"],
    "~/helpers/routes": [["default", "routes"]],
    "~/helpers/routes/fetch": ["fetchRoute"],
    "~/helpers/routes/swr": ["useRouteSWR", "useRouteMutation", "mutateRoute"],
    "~/helpers/form": ["useFieldsFilled", "useForm"],
    "~/helpers/utils": [
      "resolve",
      "isTruthy",
      "normalizeUrl",
      "useNormalizeUrl",
    ],
    "~/helpers/formatting": ["possessive"],
    "~/helpers/layouts": ["useIsMobileSize"],
    "~/helpers/userThemes": ["useUserTheme"],
    "~/helpers/vaul": ["createVaulModalPortalTarget", "useVaulPortalTarget"],
    "~/helpers/admin": ["useIsAdmin"],
    "@fullstory/browser": ["FullStory", ["isInitialized", "isFsInitialized"]],
    "@inertiajs/react": ["Link", "router"],
    "@inertiajs/core": ["hrefToUrl"],
    "@mantine/core": [
      "rem",
      "useMantineTheme",
      "useMantineColorScheme",
      "getThemeColor",
      "parseThemeColor",
      "ActionIcon",
      "Alert",
      "Anchor",
      "Badge",
      "Box",
      "Button",
      "Card",
      "Center",
      "Checkbox",
      "Chip",
      "Container",
      "Divider",
      "Flex",
      "Group",
      "List",
      "LoadingOverlay",
      "Menu",
      "Skeleton",
      "Space",
      "Stack",
      "Text",
      "Textarea",
      "TextInput",
      "Title",
      "Tooltip",
      "Transition",
    ],
    "@mantine/hooks": [
      "useDebouncedValue",
      "useDebouncedCallback",
      "useDidUpdate",
      "useElementSize",
      "useMediaQuery",
      "useMounted",
      "usePrevious",
    ],
    "@mantine/modals": ["openModal", "closeModal", "closeAllModals"],
    clsx: [["clsx", "cn"]],
    inflection: ["inflect", "humanize"],
    "lodash-es": [
      "first",
      "last",
      "get",
      "identity",
      "isEmpty",
      "isEqual",
      "isNil",
      "isUndefined",
      "keyBy",
      "mapKeys",
      "mapValues",
      "omit",
      "omitBy",
      "pick",
      "take",
      "uniqBy",
    ],
    luxon: ["DateTime", "Duration"],
    react: [
      "forwardRef",
      "startTransition",
      "useState",
      "useCallback",
      "useMemo",
      "useEffect",
      "useRef",
    ],
    sonner: ["toast"],
    "tiny-invariant": [["default", "invariant"]],
  },

  // == Types
  {
    from: "react",
    imports: [
      "ComponentPropsWithoutRef",
      "FC",
      "PropsWithChildren",
      "ReactNode",
    ],
    type: true,
  },
  {
    from: "@mantine/core",
    imports: ["BoxProps", "TextProps"],
    type: true,
  },
  {
    from: "~/helpers/inertia",
    imports: ["PageComponent"],
    type: true,
  },
  {
    from: "~/types/SharedPageProps",
    imports: [["default", "SharedPageProps"]],
    type: true,
  },
];
