import { Text } from "@mantine/core";
import { randomId } from "@mantine/hooks";

import {
  canOpenUrlInMobileSafari,
  isDesktop,
  isMobileStandaloneBrowser,
  openUrlInMobileSafari,
  shouldWaitForInstallEvent,
  useBrowserDetection,
} from "~/helpers/browsers";
import { getPWAScope } from "~/helpers/pwa";
import { type User } from "~/types";

import BrowserNotSupportedText from "./BrowserNotSupportedText";
import HomeScreenPreview from "./HomescreenPreview";
import { openWorldPageInstallationInstructionsModal } from "./WorldPageInstallationInstructionsModal";

export interface WorldPageInstallModalProps
  extends Omit<ModalBodyProps, "modalId"> {}

export const openWorldPageInstallModal = (
  props: WorldPageInstallModalProps,
): void => {
  const modalId = randomId();
  openModal({
    modalId,
    title: <>you&apos;ve created your own smaller&nbsp;world!</>,
    children: <ModalBody {...{ modalId }} {...props} />,
  });
};

interface ModalBodyProps {
  modalId: string;
  currentUser: User;
}

// eslint-disable-next-line react-refresh/only-export-components
const ModalBody: FC<ModalBodyProps> = ({ modalId, currentUser }) => {
  // == Browser detection
  const browserDetection = useBrowserDetection();

  // == PWA installation
  const {
    install: installPWA,
    installing: installingPWA,
    isStandalone,
    outOfPWAScope,
  } = usePWA();

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
          loading={
            installingPWA ||
            (browserDetection &&
              shouldWaitForInstallEvent(browserDetection) &&
              !installPWA)
          }
          disabled={
            !browserDetection ||
            (!installPWA &&
              !isMobileStandaloneBrowser(browserDetection) &&
              !canOpenUrlInMobileSafari(browserDetection))
          }
          onClick={() => {
            if (installPWA) {
              void installPWA().then(() => {
                closeModal(modalId);
                const currentUrl = hrefToUrl(location.href);
                currentUrl.searchParams.delete("intent");
                router.replace({ url: currentUrl.toString() });
              });
            } else if (
              !!browserDetection &&
              isMobileStandaloneBrowser(browserDetection)
            ) {
              if (isStandalone && outOfPWAScope) {
                const pwaScope = getPWAScope();
                const instructionsPath = withTrailingSlash(
                  routes.world.show.path({
                    query: {
                      intent: "installation_instructions",
                      pwa_scope: pwaScope,
                    },
                  }),
                );
                location.href = instructionsPath;
              } else {
                openWorldPageInstallationInstructionsModal({ currentUser });
                closeModal(modalId);
              }
            } else {
              const instructionsPath = withTrailingSlash(
                routes.world.show.path({
                  query: {
                    intent: "installation_instructions",
                  },
                }),
              );
              openUrlInMobileSafari(normalizeUrl(instructionsPath));
            }
          }}
        >
          {installPWA && browserDetection && !isDesktop(browserDetection) ? (
            <>install smaller world</>
          ) : (
            <>let&apos;s do it</>
          )}
        </Button>
        <BrowserNotSupportedText />
      </Stack>
    </Stack>
  );
};
