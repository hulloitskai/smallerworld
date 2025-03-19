import { Image, type ModalProps } from "@mantine/core";
import { type FC } from "react";

import addToHomeScreenStepSrc from "~/assets/images/add-to-home-screen-step.jpeg";
import openShareMenuStepSrc from "~/assets/images/open-share-menu-step.jpeg";

import HomeScreenPreview, {
  type HomeScreenPreviewProps,
} from "./HomeScreenPreview";

import classes from "./InstallationInstructionsModal.module.css";

export interface InstallationInstructionsModalProps
  extends Pick<ModalProps, "title">,
    Pick<HomeScreenPreviewProps, "pageName" | "pageIcon"> {}

export const openInstallationInstructionsModal = ({
  title,
  pageName,
  pageIcon,
}: InstallationInstructionsModalProps): void => {
  openModal({
    title,
    className: classes.modal,
    children: (
      <Stack py="xs">
        <StepWithImage step={1} imageSrc={openShareMenuStepSrc}>
          open the share menu
        </StepWithImage>
        <StepWithImage step={2} imageSrc={addToHomeScreenStepSrc}>
          tap 'Add to Home Screen'
        </StepWithImage>
        <Stack gap={8} align="center">
          <Badge leftSection={<>3.</>}>open from home screen</Badge>
          <HomeScreenPreview
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
      <Badge className={classes.stepBadge} leftSection={<>{step}.</>}>
        {children}
      </Badge>
      <Image className={classes.stepImage} src={imageSrc} />
    </Stack>
  );
};
