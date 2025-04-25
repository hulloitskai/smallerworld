import { type User } from "~/types";

import { openInstallationInstructionsModal } from "./InstallationInstructionsModal";

export interface WorldPageInstallationInstructionsModalProps {
  currentUser: User;
}

export const openWorldPageInstallationInstructionsModal = ({
  currentUser,
}: WorldPageInstallationInstructionsModalProps): void => {
  openInstallationInstructionsModal({
    title: <>add your smaller world to your home&nbsp;screen&nbsp;:)</>,
    pageName: "smaller world",
    pageIcon: currentUser.page_icon,
  });
};
