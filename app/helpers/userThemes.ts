import { createContext, useContext } from "react";

import { type UserTheme } from "~/types";

export const USER_THEMES: UserTheme[] = [
  "cloudflow",
  "watercolor",
  "karaoke",
  "kaleidoscope",
  "girlyMac",
  "shroomset",
  "lavaRave",
  "darkSky",
  "pool",
];

export const DARK_USER_THEMES: UserTheme[] = ["darkSky", "lavaRave", "karaoke"];

export const userThemeBackgroundVideoSrc = (theme: UserTheme): string =>
  `https://assets.getpartiful.com/backgrounds/${theme}/web.mp4`;

export const userThemeThumbnailSrc = (theme: UserTheme): string =>
  `https://assets.getpartiful.com/backgrounds/${theme}/thumbnail.png`;

export const USER_THEME_BACKGROUND_COLORS: Record<UserTheme, string> = {
  cloudflow: "rgb(167, 200, 255)",
  watercolor: "rgb(239, 239, 239)",
  karaoke: "rgb(3, 3, 120)",
  kaleidoscope: "rgb(254, 221, 218)",
  girlyMac: "rgb(222, 112, 214)",
  shroomset: "rgb(249, 128, 10)",
  lavaRave: "rgb(31, 0, 17)",
  darkSky: "rgb(23, 38, 72)",
  pool: "rgb(201, 231, 238)",
};

export interface UserThemeContext {
  theme: UserTheme | null;
  setOverrideTheme: (theme: UserTheme | null) => void;
}

export const UserThemeContext = createContext<UserThemeContext | undefined>(
  undefined,
);

export const useUserTheme = (
  overrideTheme?: UserTheme | null,
): UserTheme | null => {
  const context = useContext(UserThemeContext);
  if (!context) {
    throw new Error("useUserTheme must be used within a UserThemeProvider");
  }
  const { theme, setOverrideTheme } = context;
  useEffect(() => {
    if (overrideTheme !== undefined) {
      setOverrideTheme(overrideTheme);
    }
  }, [overrideTheme]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    return () => {
      setOverrideTheme(null);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return theme;
};
