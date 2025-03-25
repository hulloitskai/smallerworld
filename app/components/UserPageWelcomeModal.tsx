import { Text } from "@mantine/core";
import { closeModal } from "@mantine/modals";
import { v4 as uuid } from "uuid";

import { useInstallPrompt, useIsIosSafari } from "~/helpers/pwa";
import { useDirectLinkToInstallInstructions } from "~/helpers/userPages";
import { type User } from "~/types";

import HomeScreenPreview from "./HomeScreenPreview";
import { openUserPageInstallationInstructionsModal } from "./UserPageInstallationInstructionsModal";

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
  user: User;
}

// eslint-disable-next-line react-refresh/only-export-components
const ModalBody: FC<ModalBodyProps> = ({ modalId, user }) => {
  const currentFriend = useAuthenticatedFriend();
  const friendNameWithEmoji = useMemo(
    () => [currentFriend.emoji, currentFriend.name].filter(Boolean).join(" "),
    [currentFriend],
  );

  // == Add to home screen
  const { install, installing } = useInstallPrompt();
  const isIosSafari = useIsIosSafari();
  const directLinkToInstallInstructions =
    useDirectLinkToInstallInstructions(user);

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
      <Stack gap={4} align="center">
        <Button<"a" | "button">
          leftSection={<InstallIcon />}
          loading={installing}
          disabled={!install && !isIosSafari}
          {...(directLinkToInstallInstructions
            ? {
                component: "a",
                href: directLinkToInstallInstructions,
              }
            : {
                component: "button",
                onClick: () => {
                  if (install) {
                    void install();
                  } else {
                    openUserPageInstallationInstructionsModal({ user });
                    closeModal(modalId);
                  }
                },
              })}
        >
          pin to home screen
        </Button>
        {!install && isIosSafari === false && (
          <Text size="xs" c="dimmed">
            sorry, your browser isn&apos;t supported
            <Text span inherit visibleFrom="xs">
              —pls open on your phone!
            </Text>
          </Text>
        )}
      </Stack>
    </Stack>
  );
};
