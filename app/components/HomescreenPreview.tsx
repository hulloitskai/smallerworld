import { getRadius, Image, type MantineRadius, Text } from "@mantine/core";
import { type ReactNode } from "react";

import backgroundSrc from "~/assets/images/homescreen-preview-background.jpg";

import { USER_ICON_RADIUS_RATIO } from "~/helpers/users";

import classes from "./HomescreenPreview.module.css";

export interface HomescreenPreviewProps extends BoxProps {
  arrowLabel: ReactNode;
  pageName: string;
  pageIcon?: { src: string; srcset?: string | null } | null;
  radius?: MantineRadius;
}

const HomescreenPreview: FC<HomescreenPreviewProps> = ({
  pageName,
  pageIcon,
  arrowLabel,
  radius,
  ...otherProps
}) => {
  return (
    <Box
      className={cn("HomescreenPreview", classes.container)}
      pos="relative"
      style={{
        "--hp-radius": getRadius(radius),
        "--hp-icon-radius-ratio": USER_ICON_RADIUS_RATIO,
      }}
      {...otherProps}
    >
      <Image src={backgroundSrc} className={classes.background} />
      <Image
        className={classes.appIcon}
        src={pageIcon?.src ?? "/web-app-manifest-512x512.png"}
        {...(pageIcon?.srcset && { srcSet: pageIcon.srcset })}
      />
      <Text className={classes.appLabel}>{pageName || "(your name)"}</Text>
      <Text className={classes.yourPageLabel}>{arrowLabel}</Text>
    </Box>
  );
};

export default HomescreenPreview;
