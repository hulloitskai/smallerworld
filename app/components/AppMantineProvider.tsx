import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";

import { useCreateTheme } from "~/helpers/mantine";
import { DARK_USER_THEMES } from "~/helpers/userThemes";

const AppMantineProvider: FC<PropsWithChildren> = ({ children }) => {
  const theme = useCreateTheme();
  const [forceColorScheme, setForceColorScheme] = useState<"light" | "dark">();
  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName !== "data-user-theme") {
          return;
        }
        const theme = document.documentElement.getAttribute("data-user-theme");
        if (theme) {
          const themeColorScheme = (DARK_USER_THEMES as string[]).includes(
            theme,
          )
            ? "dark"
            : "light";
          setForceColorScheme(themeColorScheme);
        } else {
          setForceColorScheme(undefined);
        }
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-user-theme"],
    });
    return () => {
      observer.disconnect();
      setForceColorScheme(undefined);
    };
  }, []);

  return (
    <MantineProvider
      {...{ theme, forceColorScheme }}
      defaultColorScheme="auto"
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
