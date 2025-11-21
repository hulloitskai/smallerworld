import { isInitialized, setUser, type User } from "@sentry/react";

import { prettyFriendName } from "~/helpers/friends";

const SentryTracking: FC = () => {
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();

  // == Current user tracking
  useEffect(() => {
    if (isInitialized()) {
      if (currentFriend) {
        const { id } = currentFriend;
        const user: User = { id, name: prettyFriendName(currentFriend) };
        setUser(user);
        console.info("Set Sentry user", user);
      } else if (currentUser) {
        const { id, name } = currentUser;
        const user: User = { id, name };
        setUser(user);
        console.info("Set Sentry user", user);
      } else {
        setUser(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFriend?.id, currentUser?.id]);

  return null;
};

export default SentryTracking;
