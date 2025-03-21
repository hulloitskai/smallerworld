import { isIosWebview } from "@braintree/browser-detection";
import { Text } from "@mantine/core";
import { closeModal } from "@mantine/modals";
import { v4 as uuid } from "uuid";

import { isIosSafari } from "~/helpers/browserDetection";
import { useInstallPromptEvent, useIsInstallable } from "~/helpers/pwa";
import { type User } from "~/types";

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
    className: classes.modal,
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
  const installPromptEvent = useInstallPromptEvent();
  const isInstallable = useIsInstallable(installPromptEvent);
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
        <Button<"button" | "a">
          leftSection={<InstallIcon />}
          loading={isInstallable === undefined}
          disabled={isInstallable === false}
          {...(directLinkToInstallInstructions
            ? {
                component: "a",
                href: directLinkToInstallInstructions,
                target: "_blank",
              }
            : {
                onClick: () => {
                  if (installPromptEvent) {
                    void installPromptEvent.prompt();
                  } else if (isIosSafari()) {
                    openUserPageInstallationInstructionsModal({ user });
                    closeModal(modalId);
                  }
                },
              })}
        >
          pin to home screen
        </Button>
        {isInstallable === false && (
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

const useDirectLinkToInstallInstructions = (user: User) => {
  const currentFriend = useAuthenticatedFriend();
  const [instructionsDirectLink, setInstructionsDirectLink] = useState<
    string | null
  >(null);
  useEffect(() => {
    if (isIosWebview()) {
      const instructionsPath = routes.users.show.path({
        handle: user.handle,
        query: {
          friend_token: currentFriend.access_token,
          intent: "installation_instructions",
        },
      });
      const instructionsUrl = new URL(instructionsPath, location.origin);
      instructionsUrl.protocol = "x-safari-https:";
      setInstructionsDirectLink(instructionsUrl.toString());
    }
  }, [user.handle, currentFriend.access_token]);
  return instructionsDirectLink;
};
