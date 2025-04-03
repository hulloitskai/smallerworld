import { Text } from "@mantine/core";
import { closeModal } from "@mantine/modals";

import {
  canOpenUrlInMobileSafari,
  isMobileStandaloneBrowser,
  useBrowserDetection,
} from "~/helpers/browsers";
import { useInstallPrompt } from "~/helpers/pwa";
import { openUserPageInstallationInstructionsInMobileSafari } from "~/helpers/userPages";
import { type Friend, type User } from "~/types";

import BrowserNotSupportedText from "./BrowserNotSupportedText";
import HomeScreenPreview from "./HomeScreenPreview";
import { openUserPageInstallationInstructionsModal } from "./UserPageInstallationInstructionsModal";

export interface UserPageWelcomeModalProps
  extends Omit<ModalBodyProps, "modalId"> {}

export const openUserPageWelcomeModal = (
  props: UserPageWelcomeModalProps,
): void => {
  const modalId = uuid();
  openModal({
    modalId,
    children: <ModalBody {...{ modalId }} {...props} />,
  });
};

interface ModalBodyProps {
  modalId: string;
  currentFriend: Friend;
  user: User;
  onInstalled: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
const ModalBody: FC<ModalBodyProps> = ({
  modalId,
  currentFriend,
  user,
  onInstalled,
}) => {
  const friendNameWithEmoji = useMemo(
    () => [currentFriend.emoji, currentFriend.name].filter(Boolean).join(" "),
    [currentFriend],
  );

  // == Browser detection
  const browserDetection = useBrowserDetection();

  // == Add to home screen
  const { install, installing } = useInstallPrompt();
  return (
    <Stack gap="lg" align="center" pb="xs">
      <Stack gap={4}>
        <Title order={3} ta="center" maw={300}>
          hi, {friendNameWithEmoji}!
        </Title>
        <Text ta="center" maw={300}>
          i made this page to make it easy for you to get involved in my
          life&apos;s adventures :)
        </Text>
      </Stack>
      <HomeScreenPreview
        pageName={user.name}
        pageIcon={user.page_icon}
        arrowLabel="it's me!"
      />
      <Text ta="center" maw={300}>
        pin this page to your home screen so you can{" "}
        <span style={{ fontWeight: 600 }}>
          get notified about life updates, personal invitations, poems, and
          more!
        </span>
      </Text>
      <Stack gap={8} align="center">
        <Button
          leftSection={<InstallIcon />}
          size="md"
          loading={installing}
          disabled={
            !browserDetection ||
            (!install &&
              !isMobileStandaloneBrowser(browserDetection) &&
              !canOpenUrlInMobileSafari(browserDetection))
          }
          onClick={() => {
            if (install) {
              void install().then(onInstalled);
            } else if (
              !!browserDetection &&
              isMobileStandaloneBrowser(browserDetection)
            ) {
              openUserPageInstallationInstructionsModal({ user });
              closeModal(modalId);
            } else {
              openUserPageInstallationInstructionsInMobileSafari(
                user,
                currentFriend,
              );
            }
          }}
        >
          pin to home screen
        </Button>
        <BrowserNotSupportedText />
      </Stack>
    </Stack>
  );
};
