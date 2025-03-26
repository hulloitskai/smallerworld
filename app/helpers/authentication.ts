import { type Friend, type User } from "~/types";

export const useCurrentUser = (): User | null => {
  const { currentUser } = usePageProps();
  return currentUser;
};

export const useCurrentFriend = (): Friend | null => {
  const { currentFriend } = usePageProps();
  return currentFriend;
};
