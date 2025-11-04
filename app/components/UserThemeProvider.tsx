import {
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
  const [userTheme, setUserTheme] = useState<UserTheme | null>(null);
  const [videoSuspended, setVideoSuspended] = useState(false);

  // == Apply theme on document body
  useDidUpdate(() => {
    if (userTheme) {
      document.documentElement.setAttribute("data-user-theme", userTheme);
      document.body.style.setProperty(
        "--user-theme-background-color",
        USER_THEME_BACKGROUND_COLORS[userTheme],
      );
    } else {
      document.documentElement.removeAttribute("data-user-theme");
      document.body.style.removeProperty("--user-theme-background-color");
    }
  }, [userTheme]);

  return (
    <UserThemeContext.Provider value={{ userTheme, setUserTheme }}>
      {!!userTheme && (
        <Box
          className={classes.backdrop}
          role="backdrop"
          style={{
            backgroundImage: userThemeBackgroundMediaSrc(userTheme),
            backgroundColor: USER_THEME_BACKGROUND_COLORS[userTheme],
          }}
        >
          {IMAGE_USER_THEMES.includes(userTheme) ? (
            <div className={classes.imageContainer}>
              <img
                className={classes.image}
                src={userThemeBackgroundImageSrc(userTheme)}
              />
              <div
                className={classes.imageBackdrop}
                style={{
                  backgroundImage: userThemeBackgroundMediaSrc(userTheme),
                }}
              />
            </div>
          ) : (
            <Box
              component="video"
              autoPlay
              muted
              loop
              playsInline
              src={userThemeBackgroundVideoSrc(userTheme)}
              onSuspend={({ currentTarget }) => {
                if (!videoSuspended && currentTarget.paused) {
                  currentTarget.play().then(undefined, reason => {
                    if (
                      reason instanceof Error &&
                      reason.name === "NotAllowedError"
                    ) {
                      setVideoSuspended(true);
                    }
                  });
                }
              }}
              className={classes.video}
              mod={{ suspended: videoSuspended }}
            />
          )}
        </Box>
      )}
      {children}
    </UserThemeContext.Provider>
  );
};

export default UserThemeProvider;

const userThemeBackgroundMediaSrc = (userTheme: UserTheme): string => {
  const src = IMAGE_USER_THEMES.includes(userTheme)
    ? userThemeBackgroundImageSrc(userTheme)
    : userThemeBackgroundVideoSrc(userTheme);
  return `url(${src}), ${USER_THEME_BACKGROUND_GRADIENTS[userTheme]}`;
};
