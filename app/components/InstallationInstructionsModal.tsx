import { type BadgeProps, Image, type ModalProps, Text } from "@mantine/core";
import { randomId } from "@mantine/hooks";

import QRIcon from "~icons/heroicons/qr-code-20-solid";

import addToHomeScreenStepSrc from "~/assets/images/add-to-home-screen-step.jpeg";
import openShareMenuChromeStepSrc from "~/assets/images/open-share-menu-chrome-step.png";
import openShareMenuSafariStepSrc from "~/assets/images/open-share-menu-safari-step.jpeg";

import {
  isDesktop,
  isMobileChrome,
  useBrowserDetection,
} from "~/helpers/browsers";
import { isOutOfPWAScope, isStandalone } from "~/helpers/pwa";
import { type UserProfile } from "~/types";

import CurrentUrlQRCode from "./CurrentUrlQRCode";
import HomescreenPreviewWithIconCustomization, {
  type HomescreenPreviewWithCustomizationIconProps,
} from "./HomescreenPreviewWithCustomizableIcon";

import classes from "./InstallationInstructionsModal.module.css";

export interface InstallationInstructionsModalProps
  extends Pick<ModalProps, "title">,
    Omit<ModalBodyProps, "modalId"> {}

export const openInstallationInstructionsModal = ({
  title,
  ...otherProps
}: InstallationInstructionsModalProps): void => {
  const modalId = randomId();
  openModal({
    modalId,
    title,
    className: classes.modal,
    children: <ModalBody {...{ modalId }} {...otherProps} />,
    withCloseButton: !(isStandalone() && isOutOfPWAScope()),
  });
};

interface ModalBodyProps
  extends Pick<
    HomescreenPreviewWithCustomizationIconProps,
    "pageName" | "pageIcon"
  > {
  modalId: string;
  user?: UserProfile;
}

// eslint-disable-next-line react-refresh/only-export-components
const ModalBody: FC<ModalBodyProps> = ({
  pageName,
  pageIcon,
  modalId,
  user,
}) => {
  // == Browser detection
  const browserDetection = useBrowserDetection();

  // == PWA installation
  const { install: installPWA, installing: installingPWA } = usePWA();

  return (
    <>
      {browserDetection && (
        <>
          {isDesktop(browserDetection) ? (
            <Stack align="center" py="xs">
              <Text ta="center" fw={500}>
                smaller world is designed for phones!
              </Text>
              <CurrentUrlQRCode
                queryParams={{ intent: "installation_instructions" }}
              />
              <Badge variant="transparent" leftSection={<QRIcon />}>
                scan the QR code with your phone to continue
              </Badge>
            </Stack>
          ) : installPWA ? (
            <Stack align="center" py="xs" gap="xs">
              <Text>you&apos;re almost there!</Text>
              <Button
                variant="filled"
                size="md"
                leftSection={<InstallIcon />}
                loading={installingPWA}
                onClick={() =>
                  void installPWA().then(() => {
                    closeModal(modalId);
                    const url = hrefToUrl(location.href);
                    if (url.searchParams.has("intent")) {
                      url.searchParams.delete("intent");
                      router.replace({ url: url.toString() });
                    }
                  })
                }
              >
                install {user ? <>{possessive(user.name)} world</> : pageName}
              </Button>
            </Stack>
          ) : (
            <Stack py="xs">
              <StepWithImage
                step={1}
                imageSrc={
                  isMobileChrome(browserDetection)
                    ? openShareMenuChromeStepSrc
                    : openShareMenuSafariStepSrc
                }
              >
                open the share menu
              </StepWithImage>
              <StepWithImage step={2} imageSrc={addToHomeScreenStepSrc}>
                tap 'Add to Home Screen'
              </StepWithImage>
              <Stack gap={8} align="center">
                <StepBadge step={3}>open from home screen</StepBadge>
                <HomescreenPreviewWithIconCustomization
                  {...{ pageName, pageIcon }}
                  arrowLabel="open me!"
                  alternativeManifestIconPageUrlQuery={{
                    intent: "installation_instructions",
                  }}
                />
              </Stack>
            </Stack>
          )}
        </>
      )}
    </>
  );
};

interface StepWithImageProps extends PropsWithChildren<BoxProps> {
  step: number;
  imageSrc: string;
}

// eslint-disable-next-line react-refresh/only-export-components
const StepWithImage: FC<StepWithImageProps> = ({
  step,
  imageSrc,
  children,
  ...otherProps
}) => {
  return (
    <Stack align="center" gap={2} {...otherProps}>
      <StepBadge step={step}>{children}</StepBadge>
      <Image className={classes.stepImage} src={imageSrc} />
    </Stack>
  );
};

interface StepBadgeProps extends BadgeProps {
  step: number;
}

// eslint-disable-next-line react-refresh/only-export-components
const StepBadge: FC<StepBadgeProps> = ({ step, children, ...otherProps }) => (
  <Badge
    className={classes.stepBadge}
    variant="transparent"
    size="lg"
    leftSection={<>{step}.</>}
    {...otherProps}
  >
    {children}
  </Badge>
);
