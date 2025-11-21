import { pluralize } from "inflection";

import { prettyFriendName } from "~/helpers/friends";

const CannyTracking: FC = () => {
  const { currentUser, currentFriend } = usePageProps();

  // == Current user tracking
  useEffect(() => {
    const appId = getMeta("canny-app-id");
    if (!appId) {
      return;
    }

    if (currentFriend) {
      const user = {
        id: currentFriend.id,
        name: prettyFriendName(currentFriend),
        email: cannyEmail("friend", currentFriend.id),
        created: currentFriend.created_at,
      };
      Canny(
        "identify",
        {
          appID: appId,
          user,
          authenticateLinks: false,
        },
        () => {
          console.info("Identified Canny user", user);
        },
      );
    } else if (currentUser) {
      const { id, name } = currentUser;
      const user = {
        id,
        name,
        email: cannyEmail("user", id),
        created: currentUser.created_at,
      };
      Canny(
        "identify",
        { appID: appId, user, authenticateLinks: false },
        () => {
          console.info("Identified Canny user", user);
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFriend?.id, currentUser?.id]);

  return null;
};

export default CannyTracking;

const cannyEmail = (type: "friend" | "user", id: string) =>
  `${id}@${pluralize(type)}.smallerworld.club`;
