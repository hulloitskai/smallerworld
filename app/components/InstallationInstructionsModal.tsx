import { type BadgeProps, Image, type ModalProps } from "@mantine/core";

import addToHomeScreenStepSrc from "~/assets/images/add-to-home-screen-step.jpeg";
import openShareMenuStepSrc from "~/assets/images/open-share-menu-step.jpeg";

import HomescreenPreviewWithIconCustomization, {
  type HomescreenPreviewWithCustomizationIconProps,
} from "./HomescreenPreviewWithCustomizableIcon";

import classes from "./InstallationInstructionsModal.module.css";

export interface InstallationInstructionsModalProps
  extends Pick<ModalProps, "title">,
    Pick<HomescreenPreviewWithCustomizationIconProps, "pageName" | "pageIcon">,
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
          <StepBadge step={3}>open from home screen</StepBadge>
          <HomescreenPreviewWithIconCustomization
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
