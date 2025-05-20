import {
  PWAContext,
  useFreshCSRF,
  useInstallPWA,
  useIsStandalone,
  useOutOfPWAScope,
} from "~/helpers/pwa";
import { useActiveServiceWorker } from "~/helpers/serviceWorker";

export interface PWAProviderProps extends PropsWithChildren {}

const PWAProvider: FC<PWAProviderProps> = ({ children }) => {
  const isStandalone = useIsStandalone();
  const outOfPWAScope = useOutOfPWAScope();
  const activeServiceWorker = useActiveServiceWorker();
  const freshCSRF = useFreshCSRF();
  const { installing, install, error: installError } = useInstallPWA();
  return (
    <PWAContext.Provider
      value={{
        freshCSRF,
        isStandalone,
        outOfPWAScope,
        activeServiceWorker,
        installing,
        install,
        installError,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export default PWAProvider;
