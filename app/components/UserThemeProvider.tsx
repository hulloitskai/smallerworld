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
      document.body.style.setProperty(
        "--mantine-color-body",
        USER_THEME_BACKGROUND_COLORS[appliedTheme],
      );
      return () => {
        document.body.removeAttribute("data-user-theme");
        document.body.style.removeProperty("--mantine-color-body");
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
          {appliedTheme === "forest" ? (
            <div className={classes.forestContainer}>
              <img
                className={classes.forestImage}
                src={userThemeBackgroundImageSrc("forest")}
              />
              <div
                className={classes.forestBackdrop}
                style={{
                  backgroundImage: `url(${userThemeBackgroundImageSrc(
                    appliedTheme,
                  )}), linear-gradient(0deg, rgb(2, 0, 36) 0%, rgb(16, 33, 21) 0%, rgb(61, 132, 73) 38%, rgb(32, 69, 43) 100%)`,
                }}
              />
            </div>
          ) : (
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
