import {
  DARK_USER_THEMES,
  USER_THEME_BACKGROUND_COLORS,
  USER_THEME_BACKGROUND_GRADIENTS,
  userThemeBackgroundImageSrc,
  userThemeBackgroundVideoSrc,
  UserThemeContext,
} from "~/helpers/userThemes";
import { type UserTheme } from "~/types";

import classes from "./UserThemeProvider.module.css";

export interface UserThemeProviderProps extends PropsWithChildren {}

const UserThemeProvider: FC<UserThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<UserTheme | null>(null);

  // == Apply theme on document body
  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-user-theme", theme);
      document.body.style.setProperty(
        "--mantine-color-body",
        USER_THEME_BACKGROUND_COLORS[theme],
      );
      return () => {
        document.documentElement.removeAttribute("data-user-theme");
        document.body.style.removeProperty("--mantine-color-body");
      };
    }
  }, [theme]);

  // == Set color scheme
  const { setColorScheme, clearColorScheme } = useMantineColorScheme();
  useEffect(() => {
    if (theme) {
      const isDark = DARK_USER_THEMES.includes(theme);
      setColorScheme(isDark ? "dark" : "light");
    } else {
      clearColorScheme();
    }
  }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <UserThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {!!theme && (
        <Box
          className={classes.backdrop}
          role="backdrop"
          style={{
            backgroundImage: themeBackgroundImage(theme),
            backgroundColor: USER_THEME_BACKGROUND_COLORS[theme],
          }}
        >
          {theme === "forest" ? (
            <div className={classes.forestContainer}>
              <img
                className={classes.forestImage}
                src={userThemeBackgroundImageSrc("forest")}
              />
              <div
                className={classes.forestBackdrop}
                style={{
                  backgroundImage: themeBackgroundImage(theme),
                }}
              />
            </div>
          ) : (
            <video
              autoPlay
              muted
              loop
              playsInline
              src={userThemeBackgroundVideoSrc(theme)}
            />
          )}
        </Box>
      )}
      {children}
    </UserThemeContext.Provider>
  );
};

export default UserThemeProvider;

const themeBackgroundImage = (theme: UserTheme) => {
  const src =
    theme === "forest"
      ? userThemeBackgroundImageSrc(theme)
      : userThemeBackgroundVideoSrc(theme);
  return `url(${src}), ${USER_THEME_BACKGROUND_GRADIENTS[theme]}`;
};
