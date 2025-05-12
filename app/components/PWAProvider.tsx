import { useDocumentVisibility } from "@mantine/hooks";

import { PWAContext, useIsStandalone, useOutOfPWAScope } from "~/helpers/pwa";
import { resetSWRCache } from "~/helpers/routes/swr";

export interface PWAProviderProps extends PropsWithChildren {}

const PWAProvider: FC<PWAProviderProps> = ({ children }) => {
  const pageProps = usePageProps();
  const isStandalone = useIsStandalone();
  const outOfPWAScope = useOutOfPWAScope();
  const [freshCSRF, setFreshCSRF] = useState<{
    param: string;
    token: string;
  } | null>(() => pageProps.csrf);
  const visibility = useDocumentVisibility();
  useDidUpdate(() => {
    if (visibility === "hidden") {
      setFreshCSRF(null);
    } else if (visibility === "visible") {
      router.reload({
        only: ["csrf"],
        async: true,
        onBefore: () => {
          setFreshCSRF(null);
        },
        onSuccess: ({ props }) => {
          const { csrf } = props as unknown as SharedPageProps;
          setFreshCSRF({ param: csrf.param, token: csrf.token });
          void resetSWRCache();
        },
      });
    }
  }, [visibility]);
  return (
    <PWAContext.Provider
      value={{
        freshCSRF,
        isStandalone,
        outOfPWAScope,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export default PWAProvider;
