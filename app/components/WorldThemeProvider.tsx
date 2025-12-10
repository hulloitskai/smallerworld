import {
  IMAGE_WORLD_THEMES,
  WORLD_THEME_BACKGROUND_COLORS,
  WORLD_THEME_BACKGROUND_GRADIENTS,
  worldThemeBackgroundImageSrc,
  worldThemeBackgroundVideoSrc,
  WorldThemeContext,
} from "~/helpers/worldThemes";
import { type WorldTheme } from "~/types";

import classes from "./WorldThemeProvider.module.css";

export interface WorldThemeProviderProps extends PropsWithChildren {}

const WorldThemeProvider: FC<WorldThemeProviderProps> = ({ children }) => {
  const [worldTheme, setWorldTheme] = useState<WorldTheme | null>(null);
  const [plainBackground, setPlainBackground] = useState(false);
  const [videoSuspended, setVideoSuspended] = useState(false);

  // == Apply theme on document body
  useDidUpdate(() => {
    if (worldTheme) {
      document.documentElement.setAttribute("data-world-theme", worldTheme);
      document.body.style.setProperty(
        "--world-theme-background-color",
        WORLD_THEME_BACKGROUND_COLORS[worldTheme],
      );
    } else {
      document.documentElement.removeAttribute("data-world-theme");
      document.body.style.removeProperty("--world-theme-background-color");
    }
  }, [worldTheme]);

  return (
    <WorldThemeContext.Provider
      value={{
        worldTheme,
        setWorldTheme: (worldTheme, plainBackground) => {
          setWorldTheme(worldTheme);
          setPlainBackground(plainBackground ?? false);
        },
      }}
    >
      {!!worldTheme && (
        <Box
          className={classes.backdrop}
          role="backdrop"
          style={{
            backgroundColor: WORLD_THEME_BACKGROUND_COLORS[worldTheme],
            ...(!plainBackground && {
              backgroundImage: worldThemeBackgroundMediaSrc(worldTheme),
            }),
          }}
        >
          {plainBackground ? null : IMAGE_WORLD_THEMES.includes(worldTheme) ? (
            <div className={classes.imageContainer}>
              <img
                className={classes.image}
                src={worldThemeBackgroundImageSrc(worldTheme)}
              />
              <div
                className={classes.imageBackdrop}
                style={{
                  backgroundImage: worldThemeBackgroundMediaSrc(worldTheme),
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
              src={worldThemeBackgroundVideoSrc(worldTheme)}
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
    </WorldThemeContext.Provider>
  );
};

export default WorldThemeProvider;

const worldThemeBackgroundMediaSrc = (worldTheme: WorldTheme): string => {
  const src = IMAGE_WORLD_THEMES.includes(worldTheme)
    ? worldThemeBackgroundImageSrc(worldTheme)
    : worldThemeBackgroundVideoSrc(worldTheme);
  return `url(${src}), ${WORLD_THEME_BACKGROUND_GRADIENTS[worldTheme]}`;
};
