import {
  Identify,
  identify,
  reset,
  setUserId,
} from "@amplitude/analytics-browser";

import { prettyName } from "~/helpers/friends";

const AmplitudeTracking: FC = () => {
  const { currentUser, currentFriend } = usePageProps();

  // == Current user tracking
  useEffect(() => {
    if (currentFriend) {
      setUserId(currentFriend.id);
      const identifyEvent = new Identify();
      identifyEvent.set("name", prettyName(currentFriend));
      identifyEvent.set("type", "friend");
      identify(identifyEvent);
      return () => {
        reset();
      };
    } else if (currentUser) {
      setUserId(currentUser.id);
      const identifyEvent = new Identify();
      identifyEvent.set("name", currentUser.name);
      identifyEvent.set("handle", currentUser.handle);
      identifyEvent.set("type", "user");
      identify(identifyEvent);
      return () => {
        reset();
      };
    }
  }, [currentFriend, currentUser]);

  return null;
};

export default AmplitudeTracking;
