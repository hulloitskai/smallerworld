import { isInitialized, setUser } from "@sentry/react";

const SentryTracking: FC = () => {
  const currentUser = useCurrentUser();

  // == Current user tracking
  useEffect(() => {
    if (isInitialized()) {
      if (currentUser) {
        const { id, handle, name } = currentUser;
        setUser({ id, username: handle, name });
      } else {
        setUser(null);
      }
    }
  }, [currentUser]);

  return null;
};

export default SentryTracking;
