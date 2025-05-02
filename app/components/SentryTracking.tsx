import { isInitialized, setUser } from "@sentry/react";

const SentryTracking: FC = () => {
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();

  // == Current user tracking
  useEffect(() => {
    if (isInitialized()) {
      if (currentFriend) {
        const { id } = currentFriend;
        const name = [currentFriend.emoji, currentFriend.name]
          .filter(Boolean)
          .join(" ");
        setUser({ id, name });
      } else if (currentUser) {
        const { id, handle, name } = currentUser;
        setUser({ id, username: handle, name });
      } else {
        setUser(null);
      }
    }
  }, [currentFriend, currentUser]);

  return null;
};

export default SentryTracking;
