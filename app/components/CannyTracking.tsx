import { prettyName } from "~/helpers/friends";

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
        name: prettyName(currentFriend),
        email: fakeEmail("friend", currentFriend.id),
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
      const { id, name, page_icon } = currentUser;
      const user = {
        id,
        name,
        email: fakeEmail("user", id),
        created: currentUser.created_at,
        avatarURL: page_icon.src,
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
    }
  }, [currentFriend, currentUser]);

  return null;
};

export default CannyTracking;

const fakeEmail = (type: "friend" | "user", id: string) =>
  `${id}@${type}.smallerworld.club`;
