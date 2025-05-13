import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";

import { useTheme } from "~/helpers/mantine";

const AppMantineProvider: FC<PropsWithChildren> = ({ children }) => {
  const theme = useTheme();
  return (
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider
        {...{ theme }}
        defaultColorScheme="auto"
        {...(import.meta.env.RAILS_ENV === "test" && {
          env: "test",
        })}
      >
        <DatesProvider settings={{ locale: "en", firstDayOfWeek: 0 }}>
          {children}
        </DatesProvider>
      </MantineProvider>
    </>
  );
};

export default AppMantineProvider;
