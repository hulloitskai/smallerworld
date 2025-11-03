import { DEFAULT_THEME, MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";

import { useCreateTheme } from "~/helpers/mantine";
import { currentUserTheme, DARK_USER_THEMES } from "~/helpers/userThemes";
import { type UserTheme } from "~/types";

const AppMantineProvider: FC<PropsWithChildren> = ({ children }) => {
  const theme = useCreateTheme();
  const [detectedUserTheme, setDetectedUserTheme] = useState<UserTheme | null>(
    null,
  );
  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName !== "data-user-theme") {
          return;
        }
        const userTheme = currentUserTheme();
        if (userTheme) {
          setDetectedUserTheme(userTheme);
        } else {
          setDetectedUserTheme(null);
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-user-theme"],
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
          primary:
            detectedUserTheme === "bakudeku"
              ? DEFAULT_THEME.colors.orange
              : theme.colors?.primary,
        },
      }}
      defaultColorScheme="auto"
      {...(detectedUserTheme && {
        forceColorScheme: DARK_USER_THEMES.includes(detectedUserTheme)
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
