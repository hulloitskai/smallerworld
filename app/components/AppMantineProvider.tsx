import { DEFAULT_THEME, MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";

import { useCreateTheme } from "~/helpers/mantine";
import { currentWorldTheme, DARK_WORLD_THEMES } from "~/helpers/worldThemes";
import { type WorldTheme } from "~/types";

const AppMantineProvider: FC<PropsWithChildren> = ({ children }) => {
  const theme = useCreateTheme();
  const [detectedWorldTheme, setDetectedWorldTheme] =
    useState<WorldTheme | null>(null);
  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName !== "data-world-theme") {
          return;
        }
        const worldTheme = currentWorldTheme();
        if (worldTheme) {
          setDetectedWorldTheme(worldTheme);
        } else {
          setDetectedWorldTheme(null);
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-world-theme"],
    });
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <MantineProvider
      theme={{
        ...theme,
        colors: {
          ...theme.colors,
          ...(detectedWorldTheme === "bakudeku" && {
            primary: DEFAULT_THEME.colors.orange,
          }),
        },
      }}
      defaultColorScheme="auto"
      {...(detectedWorldTheme && {
        forceColorScheme: DARK_WORLD_THEMES.includes(detectedWorldTheme)
          ? "dark"
          : "light",
      })}
      {...(import.meta.env.RAILS_ENV === "test" && {
        env: "test",
      })}
    >
      <DatesProvider settings={{ locale: "en", firstDayOfWeek: 0 }}>
        {children}
      </DatesProvider>
    </MantineProvider>
  );
};

export default AppMantineProvider;
