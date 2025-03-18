import { type Friend, type User } from "~/types";

export const useCurrentUser = (): User | null => {
  const { currentUser } = usePageProps();
  return currentUser;
};

export const useAuthenticatedUser = (): User => {
  const currentUser = useCurrentUser();
  if (!currentUser) {
    throw new Error("no currently authenticated user");
  }
  return currentUser;
};

export const useCurrentFriend = (): Friend | null => {
  const { currentFriend } = usePageProps();
  return currentFriend;
};

export const useAuthenticatedFriend = (): Friend => {
  const currentFriend = useCurrentFriend();
  if (!currentFriend) {
    throw new Error("no currently authenticated friend");
  }
  return currentFriend;
};
