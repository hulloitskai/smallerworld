import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";

import { useCreateTheme } from "~/helpers/mantine";

const AppMantineProvider: FC<PropsWithChildren> = ({ children }) => {
  const theme = useCreateTheme();
  return (
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
  );
};

export default AppMantineProvider;
