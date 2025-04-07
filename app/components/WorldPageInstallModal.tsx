import { Text } from "@mantine/core";
import { closeModal } from "@mantine/modals";

import {
  canOpenUrlInMobileSafari,
  isMobileStandaloneBrowser,
  openUrlInMobileSafari,
  useBrowserDetection,
} from "~/helpers/browsers";
import { useInstallPrompt } from "~/helpers/pwa/install";
import { type User } from "~/types";

import BrowserNotSupportedText from "./BrowserNotSupportedText";
import HomeScreenPreview from "./HomeScreenPreview";
import { openWorldPageInstallationInstructionsModal } from "./WorldPageInstallationInstructionsModal";

export interface WorldPageInstallModalProps
  extends Omit<ModalBodyProps, "modalId"> {}

export const openWorldPageInstallModal = (
  props: WorldPageInstallModalProps,
): void => {
  const modalId = uuid();
  openModal({
    modalId,
    title: <>you&apos;ve created your own smaller&nbsp;world!</>,
    children: <ModalBody {...{ modalId }} {...props} />,
  });
};

interface ModalBodyProps {
  modalId: string;
  currentUser: User;
  onInstalled: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
const ModalBody: FC<ModalBodyProps> = ({
  modalId,
  currentUser,
  onInstalled,
}) => {
  // == Browser detection
  const browserDetection = useBrowserDetection();

  // == Add to home screen
  const { install, installing } = useInstallPrompt();
  return (
    <Stack gap="lg" align="center" pb="xs">
      <HomeScreenPreview
        pageName={currentUser.name}
        pageIcon={currentUser.page_icon}
        arrowLabel="your world!"
      />
      <Text ta="center" maw={300}>
        to continue, let&apos;s add your world to your home screen :)
      </Text>
      <Stack gap={8} align="center">
        <Button
          size="md"
          leftSection={<InstallIcon />}
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
              openWorldPageInstallationInstructionsModal({
                currentUser,
              });
              closeModal(modalId);
            } else {
              const path = routes.world.show.path({
                query: {
                  intent: "installation_instructions",
                },
              });
              const url = hrefToUrl(path);
              openUrlInMobileSafari(url.toString());
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
