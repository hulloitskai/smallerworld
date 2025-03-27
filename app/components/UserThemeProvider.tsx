import {
  DARK_USER_THEMES,
  USER_THEME_BACKGROUND_COLORS,
  userThemeBackgroundImageSrc,
  userThemeBackgroundVideoSrc,
  UserThemeContext,
} from "~/helpers/userThemes";
import { type UserTheme } from "~/types";

import classes from "./UserThemeProvider.module.css";

export interface UserThemeProviderProps extends PropsWithChildren {}

const UserThemeProvider: FC<UserThemeProviderProps> = ({ children }) => {
  const { url } = usePage();
  const isWorldPage = useMemo(() => url.startsWith("/world"), [url]);
  const currentUser = useCurrentUser();
  const [overrideTheme, setOverrideTheme] = useState<
    UserTheme | null | undefined
  >();
  const appliedTheme =
    overrideTheme !== undefined
      ? overrideTheme
      : isWorldPage
        ? (currentUser?.theme ?? null)
        : null;

  // == Set data-user-theme on body
  useEffect(() => {
    if (appliedTheme) {
      document.body.setAttribute("data-user-theme", appliedTheme);
      return () => {
        document.body.removeAttribute("data-user-theme");
      };
    }
  }, [appliedTheme]);

  // == Set color scheme
  const { setColorScheme, clearColorScheme } = useMantineColorScheme();
  useEffect(() => {
    if (appliedTheme) {
      const isDark = DARK_USER_THEMES.includes(appliedTheme);
      setColorScheme(isDark ? "dark" : "light");
    } else {
      clearColorScheme();
    }
  }, [appliedTheme]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <UserThemeContext.Provider
      value={{
        theme: appliedTheme,
        setOverrideTheme,
        clearOverrideTheme: () => setOverrideTheme(undefined),
      }}
    >
      {!!appliedTheme && (
        <Box
          className={classes.backdrop}
          role="backdrop"
          style={{
            backgroundImage: `url(${
              appliedTheme === "forest"
                ? userThemeBackgroundImageSrc(appliedTheme)
                : userThemeBackgroundVideoSrc(appliedTheme)
            })`,
            backgroundColor: USER_THEME_BACKGROUND_COLORS[appliedTheme],
          }}
          mod={{ "user-theme": appliedTheme }}
        >
          {appliedTheme !== "forest" && (
            <video
              autoPlay
              muted
              loop
              playsInline
              src={userThemeBackgroundVideoSrc(appliedTheme)}
            />
          )}
        </Box>
      )}
      {children}
    </UserThemeContext.Provider>
  );
};

export default UserThemeProvider;
