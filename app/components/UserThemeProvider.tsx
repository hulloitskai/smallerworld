import { useComputedColorScheme } from "@mantine/core";

import {
  DARK_USER_THEMES,
  IMAGE_USER_THEMES,
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
  const computedColorScheme = useComputedColorScheme();
  useEffect(() => {
    if (!theme) {
      return;
    }
    document.documentElement.setAttribute("data-user-theme", theme);
    document.body.style.setProperty(
      "--mantine-color-body",
      USER_THEME_BACKGROUND_COLORS[theme],
    );
    const themeColorScheme = DARK_USER_THEMES.includes(theme)
      ? "dark"
      : "light";
    document.documentElement.setAttribute(
      "data-mantine-color-scheme",
      themeColorScheme,
    );
    return () => {
      document.documentElement.removeAttribute("data-user-theme");
      document.body.style.removeProperty("--mantine-color-body");
      document.documentElement.setAttribute(
        "data-mantine-color-scheme",
        computedColorScheme,
      );
    };
  }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps

  // == Set color scheme
  // const { setColorScheme, clearColorScheme } = useMantineColorScheme();
  // useEffect(() => {
  //   if (!theme) {
  //     return;
  //   }
  //   const isDark = DARK_USER_THEMES.includes(theme);
  //   setColorScheme(isDark ? "dark" : "light");
  //   return () => {
  //     clearColorScheme();
  //   };
  // }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps

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
            backgroundImage: themeBackgroundMedia(theme),
            backgroundColor: USER_THEME_BACKGROUND_COLORS[theme],
          }}
        >
          {IMAGE_USER_THEMES.includes(theme) ? (
            <div className={classes.imageContainer}>
              <img
                className={classes.image}
                src={userThemeBackgroundImageSrc(theme)}
              />
              <div
                className={classes.imageBackdrop}
                style={{
                  backgroundImage: themeBackgroundMedia(theme),
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

const themeBackgroundMedia = (theme: UserTheme) => {
  const src = IMAGE_USER_THEMES.includes(theme)
    ? userThemeBackgroundImageSrc(theme)
    : userThemeBackgroundVideoSrc(theme);
  return `url(${src}), ${USER_THEME_BACKGROUND_GRADIENTS[theme]}`;
};
