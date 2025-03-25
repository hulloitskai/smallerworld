import { useMantineTheme } from "@mantine/core";

export const useIsMobileSize = (): boolean | undefined => {
  const { breakpoints } = useMantineTheme();
  return useMediaQuery(`(max-width: ${breakpoints.xs})`);
};
