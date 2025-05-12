import { type InertiaLinkProps } from "@inertiajs/react";

import { getPwaScope } from "~/helpers/pwa";

export interface PWAScopedLinkProps extends Omit<InertiaLinkProps, "href"> {
  href: string;
}

const PWAScopedLink = forwardRef<HTMLAnchorElement, PWAScopedLinkProps>(
  ({ href, ...otherProps }, ref) => {
    const [scopedHref, setScopedHref] = useState<string>();
    useEffect(() => {
      const scope = getPwaScope();
      if (scope) {
        const url = new URL(href, location.origin);
        url.searchParams.set("pwa_scope", scope);
        setScopedHref(url.toString());
      }
    }, [href]);
    return <Link {...{ ref }} href={scopedHref ?? href} {...otherProps} />;
  },
);

export default PWAScopedLink;
