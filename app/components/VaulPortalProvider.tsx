import { type PropsWithChildren } from "react";

import { VaulPortalContext } from "~/helpers/vaul";

export interface VaulPortalProviderProps extends PropsWithChildren {
  portalRoot: HTMLElement | undefined;
}

const VaulPortalProvider: FC<VaulPortalProviderProps> = ({
  children,
  portalRoot,
}) => {
  return (
    <VaulPortalContext.Provider value={{ portalRoot }}>
      {children}
    </VaulPortalContext.Provider>
  );
};

export default VaulPortalProvider;
