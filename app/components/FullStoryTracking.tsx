import { FullStory } from "@fullstory/browser";

const FullStoryTracking: FC = () => {
  const {
    component,
    props: { currentUser, currentFriend },
  } = usePage();

  // == Current user tracking
  useShallowEffect(() => {
    if (isFsInitialized()) {
      if (currentFriend) {
        const { name, emoji } = currentFriend;
        const displayName = [emoji, name].filter(Boolean).join(" ");
        void FullStory("setIdentityAsync", {
          uid: currentFriend.id,
          properties: { displayName, type: "friend" },
          schema: {
            properties: {
              type: "string",
              handle: "string",
            },
          },
          anonymous: false,
        });
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
      } else {
        void FullStory("setIdentityAsync", { anonymous: true });
      }
    }
  }, [currentUser, currentFriend]);

  // == Page tracking
  useEffect(() => {
    if (isFsInitialized()) {
      void FullStory("setPropertiesAsync", {
        type: "page",
        properties: {
          pageName: component,
        },
      });
    }
  }, [component]);

  return null;
};

export default FullStoryTracking;
