import { isInitialized, setUser } from "@sentry/react";

import { prettyName } from "~/helpers/friends";

const SentryTracking: FC = () => {
  const currentUser = useCurrentUser();
  const currentFriend = useCurrentFriend();

  // == Current user tracking
  useEffect(() => {
    if (isInitialized()) {
      if (currentFriend) {
        const { id } = currentFriend;
        setUser({ id, name: prettyName(currentFriend) });
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
