import { createContext, useContext } from "react";

import { type Encouragement, type Friend, type UserProfile } from "~/types";

import { openUrlInMobileSafari } from "./browsers";
import { queryParamsFromPath } from "./inertia/routing";

export interface UserPageProps extends SharedPageProps {
  user: UserProfile;
  replyToNumber: string | null;
  lastSentEncouragement: Encouragement | null;
  invitationRequested: boolean;
  hideNeko: boolean;
  allowFriendSharing: boolean;
}

export interface UserPageDialogState {
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

export const UserPageDialogStateContext = createContext<
  UserPageDialogState | undefined
>(undefined);

const useUserPageDialogState = (): UserPageDialogState => {
  const state = useContext(UserPageDialogStateContext);
  if (!state) {
    throw new Error(
      "useUserPageDialogState must be used within a UserPageDialogStateProvider",
    );
  }
  return state;
};

export const useUserPageDialogOpened = (opened?: boolean): boolean => {
  const state = useUserPageDialogState();
  useEffect(() => {
    if (typeof opened === "boolean") {
      state.setOpened(opened);
    }
  }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps
  return state.opened;
};

interface UserPageInstallationInstructionsInMobileSafariSettings {
  currentFriend: Friend;
  user: UserProfile;
}

export const openUserPageInstallationInstructionsInMobileSafari = ({
  currentFriend,
  user,
}: UserPageInstallationInstructionsInMobileSafariSettings) => {
  const instructionsQuery: Record<string, string> = {
    friend_token: currentFriend.access_token,
    intent: "installation_instructions",
  };
  const { manifest_icon_type } = queryParamsFromPath(location.href);
  if (manifest_icon_type) {
    instructionsQuery.manifest_icon_type = manifest_icon_type;
  }
  const instructionsPath = routes.users.show.path({
    id: user.handle,
    query: instructionsQuery,
  });
  openUrlInMobileSafari(instructionsPath);
};
