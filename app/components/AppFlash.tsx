import { useWindowEvent } from "@mantine/hooks";

const AppFlash: FC = () => {
  // Clear flash messages when going back in history
  useWindowEvent("popstate", ({ state }) => {
    if (state instanceof Object && "props" in state) {
      const { props } = state;
      if (isPropsWithFlash(props)) {
        props.flash = {};
      }
    }
  });

  // Show flash messages
  const { flash } = usePageProps();
  useEffect(() => {
    if (flash) {
      const messages = pick(flash, "notice", "alert");
      Object.entries(messages).forEach(([type, message]) => {
        if (message) {
          switch (type) {
            case "notice":
              toast.info(message);
              break;
            case "alert":
              toast.error(message);
              break;
            default:
              toast(message);
          }
        }
      });
    }
  }, [flash]);

  return null;
};

export default AppFlash;

const isPropsWithFlash = (
  props: any,
): props is { flash: Record<string, string> } =>
  props instanceof Object && "flash" in props;
