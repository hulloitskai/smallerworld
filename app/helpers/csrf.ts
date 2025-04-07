export const useCSRFToken = (): string => {
  const { csrf } = usePageProps();
  return csrf.token;
};
