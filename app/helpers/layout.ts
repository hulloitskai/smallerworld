import { useIsStandalone } from "./pwa";

export type DynamicProp<PageProps extends SharedPageProps, T> =
  | T
  | ((props: PageProps, isStandalone: boolean | undefined) => T);

export const useResolveDynamicProp = <PageProps extends SharedPageProps, T>(
  prop: T | ((props: PageProps, isStandalone: boolean | undefined) => T),
  pageProps: PageProps,
) => {
  const isStandalone = useIsStandalone();
  return useMemo(
    () => resolveDynamicProp(prop, pageProps, isStandalone),
    [prop, pageProps, isStandalone],
  );
};

export const resolveDynamicProp = <PageProps extends SharedPageProps, T>(
  prop: T | ((props: PageProps, isStandalone: boolean | undefined) => T),
  pageProps: PageProps,
  isStandalone: boolean | undefined,
) => (prop instanceof Function ? prop(pageProps, isStandalone) : prop);
