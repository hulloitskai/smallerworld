const useInstallPromptEvent = ():
  | BeforeInstallPromptEvent
  | undefined
  | null => {
  const [event, setEvent] = useState<
    BeforeInstallPromptEvent | undefined | null
  >();
  useEffect(() => {
    const capturedEvent = window.installPromptEvent;
    setEvent(capturedEvent ?? null);
    const listener = (event: Event) => {
      event.preventDefault();
      setEvent(event as BeforeInstallPromptEvent);
    };
    addEventListener("beforeinstallprompt", listener);
    return () => {
      removeEventListener("beforeinstallprompt", listener);
    };
  }, []);
  return event;
};

export interface InstallPromptResult {
  installing: boolean;
  install: (() => Promise<void>) | null | undefined;
  error: Error | undefined;
}

export const useInstallPrompt = (): InstallPromptResult => {
  const installPromptEvent = useInstallPromptEvent();
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const install = useMemo<(() => Promise<void>) | null | undefined>(() => {
    if (installPromptEvent) {
      return () => {
        setInstalling(true);
        return installPromptEvent
          .prompt()
          .catch(error => {
            console.error("Failed to install to home screen", error);
            if (error instanceof Error) {
              setError(error);
              toast.error("failed to install to home screen", {
                description: error.message,
              });
            }
          })
          .finally(() => {
            setInstalling(false);
          });
      };
    }
    return installPromptEvent;
  }, [installPromptEvent]);
  return {
    installing,
    install,
    error,
  };
};
