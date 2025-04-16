import { Image, type ModalProps } from "@mantine/core";

import addToHomeScreenStepSrc from "~/assets/images/add-to-home-screen-step.jpeg";
import openShareMenuStepSrc from "~/assets/images/open-share-menu-step.jpeg";

import HomeScreenPreviewWithIconCustomization, {
  type HomeScreenPreviewWithCustomizationIconProps,
} from "./HomeScreenPreviewWithCustomizableIcon";

import classes from "./InstallationInstructionsModal.module.css";

export interface InstallationInstructionsModalProps
  extends Pick<ModalProps, "title">,
    Pick<HomeScreenPreviewWithCustomizationIconProps, "pageName" | "pageIcon">,
    PropsWithChildren {}

export const openInstallationInstructionsModal = ({
  title,
  pageName,
  pageIcon,
  children,
}: InstallationInstructionsModalProps): void => {
  openModal({
    title,
    className: classes.modal,
    children: (
      <Stack py="xs">
        {children}
        <StepWithImage step={1} imageSrc={openShareMenuStepSrc}>
          open the share menu
        </StepWithImage>
        <StepWithImage step={2} imageSrc={addToHomeScreenStepSrc}>
          tap 'Add to Home Screen'
        </StepWithImage>
        <Stack gap={8} align="center">
          <Badge className={classes.stepBadge} size="lg" leftSection={<>3.</>}>
            open from home screen
          </Badge>
          <HomeScreenPreviewWithIconCustomization
            {...{ pageName, pageIcon }}
            arrowLabel="open me!"
          />
        </Stack>
      </Stack>
    ),
  });
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
    <Stack align="center" gap={8} {...otherProps}>
      <Badge className={classes.stepBadge} size="lg" leftSection={<>{step}.</>}>
        {children}
      </Badge>
      <Image className={classes.stepImage} src={imageSrc} />
    </Stack>
  );
};
