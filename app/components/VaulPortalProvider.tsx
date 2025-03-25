import { type PropsWithChildren } from "react";

import { VaulPortalContext } from "~/helpers/vaul";

export interface VaulPortalProviderProps extends PropsWithChildren {
  portalRoot: HTMLElement | undefined;
}

const VaulPortalProvider: FC<VaulPortalProviderProps> = ({
  children,
  portalRoot,
}) => {
  const value = useMemo(() => ({ root: portalRoot }), [portalRoot]);
  return (
    <VaulPortalContext.Provider {...{ value }}>
      {children}
    </VaulPortalContext.Provider>
  );
};

export default VaulPortalProvider;
