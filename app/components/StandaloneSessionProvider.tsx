import { useDocumentVisibility } from "@mantine/hooks";

import {
  type StandaloneSession,
  StandaloneSessionContext,
} from "~/helpers/pwa/session";
import { resetSWRCache } from "~/helpers/routes/swr";

export interface StandaloneSessionProviderProps extends PropsWithChildren {}

const StandaloneSessionProvider: FC<StandaloneSessionProviderProps> = ({
  children,
}) => {
  const isStandalone = useIsStandalone();
  const pageProps = usePageProps();
  const [session, setSession] = useState<
    StandaloneSession | null | undefined
  >();
  const visibility = useDocumentVisibility();
  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (isStandalone === undefined) {
      setSession(undefined);
    } else if (isStandalone === false) {
      setSession(null);
    } else if (visibility === "visible") {
      if (isInitialLoad.current) {
        setSession({ csrf: pageProps.csrf });
        isInitialLoad.current = false;
      } else {
        router.reload({
          only: ["csrf"],
          async: true,
          onBefore: () => {
            setSession(undefined);
          },
          onSuccess: ({ props }) => {
            const { csrf } = props as unknown as SharedPageProps;
            setSession({ csrf });
            void resetSWRCache();
          },
        });
      }
    } else {
      setSession(undefined);
    }
  }, [visibility, isStandalone]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <StandaloneSessionContext.Provider value={session}>
      {children}
    </StandaloneSessionContext.Provider>
  );
};

export default StandaloneSessionProvider;
