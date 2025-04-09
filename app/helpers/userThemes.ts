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
  "forest",
  "toile",
];

export const DARK_USER_THEMES: UserTheme[] = [
  "darkSky",
  "forest",
  "karaoke",
  "lavaRave",
];

export const userThemeBackgroundVideoSrc = (theme: UserTheme): string =>
  `https://assets.getpartiful.com/backgrounds/${theme}/web.mp4`;

export const userThemeBackgroundImageSrc = (theme: UserTheme): string =>
  `https://assets.getpartiful.com/backgrounds/${theme}/web.jpg`;

export const userThemeThumbnailSrc = (theme: UserTheme): string =>
  `https://assets.getpartiful.com/backgrounds/${theme}/thumbnail.png`;

export const USER_THEME_BACKGROUND_COLORS: Record<UserTheme, string> = {
  cloudflow: "rgb(167, 200, 255)",
  watercolor: "rgb(239, 239, 239)",
  karaoke: "#000037",
  kaleidoscope: "rgb(254, 221, 218)",
  girlyMac: "rgb(222, 112, 214)",
  shroomset: "rgb(249, 128, 10)",
  lavaRave: "rgb(31, 0, 17)",
  darkSky: "rgb(23, 38, 72)",
  pool: "rgb(201, 231, 238)",
  forest: "rgb(24, 53, 30)",
  toile: "rgb(255, 255, 255)",
};

export const USER_THEME_BACKGROUND_GRADIENTS: Record<UserTheme, string> = {
  cloudflow:
    "linear-gradient(90deg, rgb(113, 155, 209) 0%, rgb(182, 131, 187) 22%, rgb(211, 164, 137) 41%, rgb(227, 142, 108) 67%, rgb(94, 146, 208) 98%)",
  watercolor:
    "linear-gradient(90deg, rgb(234, 217, 239) 0%, rgb(243, 243, 243) 40%, rgb(188, 238, 238) 70%, rgb(241, 201, 167) 100%)",
  karaoke:
    "linear-gradient(90deg, rgb(207, 0, 249) 0%, rgb(3, 3, 120) 50%, rgb(207, 0, 249) 100%)",
  kaleidoscope:
    "linear-gradient(90deg, rgb(254, 239, 254) 0%, rgb(161, 237, 244) 29%, rgb(250, 236, 188) 53%, rgb(166, 198, 254) 78%, rgb(205, 187, 235) 98%)",
  girlyMac:
    "linear-gradient(90deg, rgb(185, 225, 226) 0%, rgb(204, 186, 222) 22%, rgb(230, 192, 230) 41%, rgb(243, 74, 207) 67%, rgb(255, 107, 252) 98%)",
  shroomset:
    "linear-gradient(90deg, rgb(240, 97, 2) 0%, rgb(217, 103, 193) 43%, rgb(96, 226, 195) 65%, rgb(217, 139, 180) 95%)",
  lavaRave:
    "linear-gradient(90deg, rgb(69, 17, 66) 0%, rgb(201, 49, 199) 43%, rgb(226, 85, 128) 100%)",
  darkSky:
    "linear-gradient(90deg, rgb(27, 41, 75) 0%, rgb(121, 96, 94) 50%, rgb(70, 115, 128) 100%)",
  pool: "linear-gradient(to right top, rgb(188, 223, 230) 0%, 15%, rgb(177, 210, 229) 27%, 50%, rgb(215, 237, 245) 58%, 63%, rgb(212, 237, 247) 70%, 85%, rgb(195, 225, 231) 95%)",
  forest:
    "linear-gradient(0deg, rgb(2, 0, 36) 0%, rgb(16, 33, 21) 0%, rgb(61, 132, 73) 38%, rgb(32, 69, 43) 100%)",
  toile:
    "linear-gradient(90deg, rgb(211, 225, 254) 0%, rgb(255, 255, 255) 50%, rgb(211, 225, 254) 100%)",
};

export interface UserThemeContext {
  theme: UserTheme | null;
  setTheme: (theme: UserTheme | null) => void;
}

export const UserThemeContext = createContext<UserThemeContext | undefined>(
  undefined,
);

export const useUserTheme = (theme?: UserTheme | null): UserTheme | null => {
  const context = useContext(UserThemeContext);
  if (!context) {
    throw new Error("useUserTheme must be used within a UserThemeProvider");
  }
  const { theme: activeTheme, setTheme } = context;
  useEffect(() => {
    if (theme !== undefined) {
      setTheme(theme);
    }
  }, [theme]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    return () => {
      setTheme(null);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return activeTheme;
};
