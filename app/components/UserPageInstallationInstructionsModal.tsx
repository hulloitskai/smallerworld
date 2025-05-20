import { type User } from "~/types";

import { openInstallationInstructionsModal } from "./InstallationInstructionsModal";

export interface UserPageInstallationInstructionsModalProps {
  user: User;
}

export const openUserPageInstallationInstructionsModal = ({
  user,
}: UserPageInstallationInstructionsModalProps): void => {
  openInstallationInstructionsModal({
    title: <>install {possessive(user.name)} world 📲</>,
    pageName: user.name,
    pageIcon: user.page_icon,
    user,
  });
};
