import Clarity from "@microsoft/clarity";

const ClarityTracking: FC = () => {
  const {
    component,
    props: { currentFriend, currentUser },
  } = usePage();

  // == Current user tracking
  useEffect(() => {
    if (!("clarity" in window)) {
      return;
    }
    if (currentFriend) {
      const { id, name } = currentFriend;
      Clarity.identify(id, undefined, component, name);
    } else if (currentUser) {
      const { id, name } = currentUser;
      Clarity.identify(id, undefined, component, name);
    }
  }, [currentFriend, currentUser, component]);

  return null;
};

export default ClarityTracking;
