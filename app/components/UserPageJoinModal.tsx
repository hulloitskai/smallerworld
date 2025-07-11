import { Text } from "@mantine/core";
import { randomId } from "@mantine/hooks";

import {
  canOpenUrlInMobileSafari,
  isDesktop,
  isMobileStandaloneBrowser,
  shouldWaitForInstallEvent,
  useBrowserDetection,
} from "~/helpers/browsers";
import { openUserPageInstallationInstructionsInMobileSafari } from "~/helpers/userPages";
import { type Friend, type User } from "~/types";

import BrowserNotSupportedText from "./BrowserNotSupportedText";
import HomeScreenPreviewWithIconCustomization from "./HomescreenPreviewWithCustomizableIcon";
import { openUserPageInstallationInstructionsModal } from "./UserPageInstallationInstructionsModal";

import classes from "./UserPageJoinModal.module.css";

export interface UserPageJoinModalProps
  extends Omit<ModalBodyProps, "modalId" | "onInstalled"> {}

export const openUserPageJoinModal = (props: UserPageJoinModalProps): void => {
  const modalId = randomId();
  openModal({
    modalId,
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

  // == PWA installation
  const { install, installing } = usePWA();

  // == Determine if we should wait for install event
  const waitingForInstallEvent = useMemo(() => {
    if (!browserDetection) return false;
    return shouldWaitForInstallEvent(browserDetection) && !install;
  }, [browserDetection, install]);

  return (
    <Stack gap="lg" align="center" pb="xs">
      <Stack gap={4}>
        <Title order={3} ta="center" maw={300}>
          hi, {friendNameWithEmoji}!
        </Title>
        <Text ta="center" maw={300}>
          i made an app that tells you what&apos;s{" "}
          <span style={{ fontWeight: 600, fontStyle: "italic" }}>actually</span>{" "}
          going on in my life :)
        </Text>
      </Stack>
      <HomeScreenPreviewWithIconCustomization
        pageName={user.name}
        pageIcon={user.page_icon}
        arrowLabel="it's me!"
        alternativeManifestIconPageUrlQuery={{ intent: "join" }}
      />
      <Stack gap="xs">
        <Text ta="center" maw={300}>
          you can install it, and{" "}
          <span style={{ fontWeight: 600 }}>
            get notified about life updates, personal invitations, poems, and
            more!
          </span>
        </Text>
        <Text
          className={classes.notificationNotice}
          size="sm"
          ta="center"
          maw={300}
        >
          (and you&apos;ll ONLY get notifications from {user.name}—this
          isn&apos;t a social network)
        </Text>
      </Stack>
      <Stack gap={8} align="center">
        <Button
          variant="filled"
          size="md"
          leftSection={<InstallIcon />}
          loading={installing || waitingForInstallEvent}
          disabled={!browserDetection}
          onClick={() => {
            invariant(browserDetection, "Missing browser detection");
            if (install && !isDesktop(browserDetection)) {
              void install().then(() => {
                closeModal(modalId);
                const url = new URL(location.href);
                if (url.searchParams.has("intent")) {
                  url.searchParams.delete("intent");
                  router.replace({ url: url.toString() });
                }
              });
            } else if (
              !isMobileStandaloneBrowser(browserDetection) &&
              canOpenUrlInMobileSafari(browserDetection)
            ) {
              openUserPageInstallationInstructionsInMobileSafari(
                user,
                currentFriend,
              );
            } else {
              openUserPageInstallationInstructionsModal({ user });
              closeModal(modalId);
            }
          }}
        >
          {install && browserDetection && !isDesktop(browserDetection) ? (
            <>install {possessive(user.name)} world</>
          ) : (
            <>let&apos;s do it</>
          )}
        </Button>
        <BrowserNotSupportedText />
      </Stack>
    </Stack>
  );
};
