import { registerServiceWorker } from "~/helpers/serviceWorker";
import { type Friend, type User } from "~/types";

const RegisterServiceWorker: FC = () => {
  const { currentUser, currentFriend } = usePageProps();
  const registeredRef = useRef(false);
  useEffect(() => {
    if (registeredRef.current) {
      return;
    }
    registeredRef.current = true;
    const useNewServiceWorker = currentFriend
      ? isKaiFriend(currentFriend)
      : isKaiUser(currentUser);
    registerServiceWorker({ deprecated: !useNewServiceWorker });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

export default RegisterServiceWorker;

const isKaiUser = (user: User | null) => {
  if (user) {
    return user.handle === "itskai";
  }
  return false;
};

const isKaiFriend = (friend: Friend | null) => {
  if (friend) {
    const normalizedName = friend.name.toLocaleLowerCase();
    if (normalizedName.includes("m'kai")) {
      return false;
    }
    return normalizedName.includes("kai");
  }
  return false;
};
