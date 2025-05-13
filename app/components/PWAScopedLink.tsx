import { type InertiaLinkProps } from "@inertiajs/react";

import { queryParamsFromPath } from "~/helpers/inertia/routing";
import { getPWAScope } from "~/helpers/pwa";

export interface PWAScopedLinkProps extends Omit<InertiaLinkProps, "href"> {
  href: string;
}

const PWAScopedLink = forwardRef<HTMLAnchorElement, PWAScopedLinkProps>(
  ({ href, ...otherProps }, ref) => {
    const { isStandalone } = usePWA();
    const [scopedHref, setScopedHref] = useState<string>();
    useEffect(() => {
      const { pwa_scope: previousScope } = queryParamsFromPath(location.href);
      if (previousScope) {
        setScopedHref(addScopeToHref(href, previousScope));
      } else if (isStandalone) {
        const currentScope = getPWAScope();
        if (currentScope) {
          setScopedHref(addScopeToHref(href, currentScope));
        }
      }
    }, [href, isStandalone]);
    return <Link {...{ ref }} href={scopedHref ?? href} {...otherProps} />;
  },
);

export default PWAScopedLink;

const addScopeToHref = (href: string, scope: string) => {
  const url = new URL(href, location.origin);
  url.searchParams.set("pwa_scope", scope);
  return url.toString();
};
