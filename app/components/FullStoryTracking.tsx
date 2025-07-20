import { FullStory } from "@fullstory/browser";

import { prettyName } from "~/helpers/friends";

const FullStoryTracking: FC = () => {
  const {
    component,
    props: { currentUser, currentFriend },
  } = usePage();

  // == Current user tracking
  useEffect(() => {
    if (!isFsInitialized()) {
      return;
    }
    if (currentFriend) {
      void FullStory("setIdentityAsync", {
        uid: currentFriend.id,
        properties: { displayName: prettyName(currentFriend), type: "friend" },
        schema: {
          properties: {
            type: "string",
            handle: "string",
          },
        },
        anonymous: false,
      });
      return () => {
        void FullStory("setIdentityAsync", { anonymous: true });
      };
    } else if (currentUser) {
      const { id, name, handle } = currentUser;
      void FullStory("setIdentityAsync", {
        uid: id,
        properties: { displayName: name, handle, type: "user" },
        schema: {
          properties: {
            type: "string",
            handle: "string",
          },
        },
        anonymous: false,
      });
      return () => {
        void FullStory("setIdentityAsync", { anonymous: true });
      };
    }
  }, [currentFriend, currentUser]);

  // == Page tracking
  useEffect(() => {
    if (!isFsInitialized()) {
      return;
    }
    void FullStory("setPropertiesAsync", {
      type: "page",
      properties: {
        pageName: component,
      },
    });
  }, [component]);

  return null;
};

export default FullStoryTracking;
