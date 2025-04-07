import { useMediaQuery } from "@mantine/hooks";
import { useMounted } from "@mantine/hooks";

export const useIsStandalone = (): boolean | undefined => {
  const mounted = useMounted();
  const isStandalone = useMediaQuery("(display-mode: standalone)");
  if (mounted) {
    return isStandalone;
  }
};
