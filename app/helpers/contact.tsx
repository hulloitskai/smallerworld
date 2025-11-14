export interface UseContactOptions {
  type?: "email" | "sms";
  subject?: string;
  body?: string;
  onTriggered?: () => void;
}

export interface UseContactResult {
  loading: boolean;
  error?: Error;
}

export const useContact = (
  options?: UseContactOptions,
): [(options?: UseContactOptions) => void, UseContactResult] => {
  const [result, setResult] = useState<UseContactResult>({
    loading: false,
  });
  const contact = useCallback(() => {
    setResult(result => ({ ...result, loading: true }));
    const { onTriggered, ...params } = options ?? {};
    fetchRoute<{ mailto: string; sms: string }>(routes.contactUrls.show, {
      descriptor: "load contact info",
      params: { query: params },
    })
      .then(
        ({ mailto, sms }): void => {
          location.href = params.type === "sms" ? sms : mailto;
          onTriggered?.();
        },
        reason => {
          console.error("Failed to redirect to contact URI", reason);
          if (reason instanceof Error) {
            setResult(result => ({ ...result, error: reason }));
          }
        },
      )
      .finally(() => {
        setResult(result => ({ ...result, loading: false }));
      });
  }, [options]);
  return [contact, result];
};
