import { type BadgeProps, Image, Text } from "@mantine/core";

import QRIcon from "~icons/heroicons/qr-code-20-solid";

import addToHomeScreenStepSrc from "~/assets/images/add-to-home-screen-step.jpeg";
import openShareMenuChromeStepSrc from "~/assets/images/open-share-menu-chrome-step.png";
import openShareMenuSafariStepSrc from "~/assets/images/open-share-menu-safari-step.jpeg";

import {
  isDesktop,
  isIos,
  isMobileChrome,
  useBrowserDetection,
} from "~/helpers/browsers";
import { type WorldProfile } from "~/types";

import ContactLink from "./ContactLink";
import CurrentUrlQRCode from "./CurrentUrlQRCode";
import WorldHomescreenPreview, {
  type WorldHomescreenPreviewProps,
} from "./WorldHomescreenPreview";
import WorldHomescreenPreviewWithAlternateIcon from "./WorldHomescreenPreviewWithAlternateIcon";

import classes from "./InstallModal.module.css";

export interface InstallModalBodyProps
  extends Pick<WorldHomescreenPreviewProps, "arrowLabel"> {
  world?: WorldProfile;
  modalId: string;
}

export const InstallModalBody: FC<InstallModalBodyProps> = ({
  world,
  arrowLabel,
  modalId,
}) => {
  const currentUser = useCurrentUser();

  // == Browser detection
  const browserDetection = useBrowserDetection();

  // == PWA installation
  const { install: installPWA, installing: installingPWA } = usePWA();

  return (
    <Stack align="center">
      <Stack align="center" gap={6} my="sm">
        <WorldHomescreenPreview {...{ world, arrowLabel }} />
        <Text ta="center" size="xs" c="dimmed" fw={600}>
          pov: your homescreen in 10 seconds
        </Text>
      </Stack>
      <Divider
        label={
          <>
            installation instructions{" "}
            <span className={classes.emoji} style={{ marginLeft: rem(2) }}>
              ⤵️
            </span>
          </>
        }
        style={{ alignSelf: "stretch" }}
      />
      {browserDetection && (
        <>
          {isDesktop(browserDetection) ? (
            <Stack align="center" gap="lg" py="xs">
              <Text size="sm" ta="center" c="dimmed" maw={300}>
                smaller world is designed for phones!
              </Text>
              <CurrentUrlQRCode queryParams={{ intent: "install" }} />
              <Badge variant="transparent" leftSection={<QRIcon />}>
                scan the QR code with your phone
              </Badge>
            </Stack>
          ) : isIos(browserDetection) ? (
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
                {world ? (
                  <WorldHomescreenPreviewWithAlternateIcon
                    {...{ world }}
                    arrowLabel="open me!"
                    alternativeManifestIconPageUrlQuery={{ intent: "install" }}
                  />
                ) : (
                  <WorldHomescreenPreview
                    {...{ world }}
                    arrowLabel="open me!"
                  />
                )}
              </Stack>
            </Stack>
          ) : installPWA !== null ? (
            <Stack align="center" gap="xs" py="xs">
              <Button
                className={classes.installButton}
                variant="filled"
                size="lg"
                leftSection={<InstallIcon />}
                loading={!installPWA || installingPWA}
                onClick={() => {
                  if (!installPWA) {
                    return;
                  }
                  void installPWA().then(() => {
                    closeModal(modalId);
                    const currentUrl = hrefToUrl(location.href);
                    if (currentUrl.searchParams.has("intent")) {
                      currentUrl.searchParams.delete("intent");
                      router.replace({ url: currentUrl.toString() });
                    }
                  });
                }}
              >
                install{" "}
                {world
                  ? world.owner_id === currentUser?.id
                    ? "your world"
                    : world.name
                  : "smaller world"}
              </Button>
              <Text size="sm" ta="center" c="dimmed" maw={300}>
                you&apos;re almost there!!!
                <br />
                click here to install{" "}
                {world
                  ? world.owner_id === currentUser?.id
                    ? "your world"
                    : world.name
                  : "smaller world"}
                ...
              </Text>
            </Stack>
          ) : (
            <Box ta="center">
              <Text c="dimmed">sorry, your browser is not supported :(</Text>
              <ContactLink type="sms" body="my browser isn't supported :(">
                tell the developer!!
              </ContactLink>
            </Box>
          )}
        </>
      )}
    </Stack>
  );
};

interface StepWithImageProps extends PropsWithChildren<BoxProps> {
  step: number;
  imageSrc: string;
}

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
