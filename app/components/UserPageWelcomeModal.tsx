import { Text } from "@mantine/core";
import { closeModal } from "@mantine/modals";
import { v4 as uuid } from "uuid";

import {
  useBrowserDetection,
  useIsDesktop,
  useIsIosAndStuckInAppBrowser,
  useIsMobileSafari,
} from "~/helpers/browsers";
import { useInstallPrompt } from "~/helpers/pwa";
import { openUserPageInMobileSafari } from "~/helpers/userPages";
import { type Friend, type User } from "~/types";

import HomeScreenPreview from "./HomeScreenPreview";
import { openUserPageInstallationInstructionsModal } from "./UserPageInstallationInstructionsModal";

import classes from "./UserPageWelcomeModal.module.css";

export interface UserPageWelcomeModalProps
  extends Omit<ModalBodyProps, "modalId"> {}

export const openUserPageWelcomeModal = (
  props: UserPageWelcomeModalProps,
): void => {
  const modalId = uuid();
  openModal({
    modalId: modalId,
    children: <ModalBody {...{ modalId }} {...props} />,
  });
};

interface ModalBodyProps {
  modalId: string;
  currentFriend: Friend;
  user: User;
}

// eslint-disable-next-line react-refresh/only-export-components
const ModalBody: FC<ModalBodyProps> = ({ modalId, currentFriend, user }) => {
  const friendNameWithEmoji = useMemo(
    () => [currentFriend.emoji, currentFriend.name].filter(Boolean).join(" "),
    [currentFriend],
  );

  // == Browser detection
  const browserDetection = useBrowserDetection();
  const isIosAndStuckInAppBrowser =
    useIsIosAndStuckInAppBrowser(browserDetection);
  const isMobileSafari = useIsMobileSafari(browserDetection);
  const isDesktop = useIsDesktop(browserDetection);

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
          loading={installing}
          disabled={
            !!isIosAndStuckInAppBrowser || (!isMobileSafari && !install)
          }
          onClick={() => {
            if (install) {
              void install();
            } else if (isMobileSafari) {
              openUserPageInstallationInstructionsModal({ user });
              closeModal(modalId);
            } else {
              openUserPageInMobileSafari(user, currentFriend);
            }
          }}
        >
          pin to home screen
        </Button>
        {isIosAndStuckInAppBrowser ? (
          <Text className={classes.notSupportedText}>
            "open in safari to continue"
          </Text>
        ) : (
          <>
            {install === null && !isMobileSafari && (
              <Text className={classes.notSupportedText}>
                sorry, your browser isn&apos;t supported
                {isDesktop && (
                  <Text span inherit visibleFrom="xs">
                    —pls open on your phone!
                  </Text>
                )}
              </Text>
            )}
          </>
        )}
      </Stack>
    </Stack>
  );
};
