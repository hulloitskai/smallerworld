import { createContext, useContext } from "react";

export const createVaulModalPortalTarget = (): HTMLElement | undefined => {
  const target = document.querySelector<HTMLElement>(
    "[data-vaul-modal-portal-target]",
  );
  return target ?? undefined;
};

export const createVaulPortalRoot = (): HTMLElement | undefined => {
  const root = document.querySelector<HTMLElement>("[data-vaul-portal-root]");
  if (root) {
    const target = document.createElement("div");
    target.dataset.portal = "true";
    root.appendChild(target);
    return target;
  }
};

export interface VaulPortalContext {
  portalRoot: HTMLElement | undefined;
}

export const VaulPortalContext = createContext<VaulPortalContext | undefined>(
  undefined,
);

export const useVaulPortalTarget = (): HTMLElement | undefined => {
  const { portalRoot } = useContext(VaulPortalContext) ?? {};
  const [target, setTarget] = useState<HTMLElement | undefined>();
  useEffect(() => {
    if (portalRoot) {
      const target = document.createElement("div");
      target.dataset.portal = "true";
      portalRoot.appendChild(target);
      setTarget(target);
    } else {
      setTarget(undefined);
    }
  }, [portalRoot]);
  return target;
};
