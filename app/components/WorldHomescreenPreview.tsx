import { getRadius, Image, type MantineRadius, Text } from "@mantine/core";
import { type ReactNode } from "react";

import backgroundSrc from "~/assets/images/homescreen-preview-background.jpg";

import { WORLD_ICON_RADIUS_RATIO } from "~/helpers/worlds";
import { type WorldProfile } from "~/types";

import classes from "./WorldHomescreenPreview.module.css";

export interface WorldHomescreenPreviewProps extends BoxProps {
  world?: Partial<Pick<WorldProfile, "icon" | "owner_name">> | null;
  arrowLabel: ReactNode;
  radius?: MantineRadius;
  loading?: boolean;
}

const WorldHomescreenPreview: FC<WorldHomescreenPreviewProps> = ({
  world,
  arrowLabel,
  radius,
  loading,
  ...otherProps
}) => {
  return (
    <Box
      className={cn("HomescreenPreview", classes.container)}
      pos="relative"
      style={{
        "--hp-radius": getRadius(radius),
        "--hp-icon-radius-ratio": WORLD_ICON_RADIUS_RATIO,
      }}
      {...otherProps}
    >
      <Image src={backgroundSrc} className={classes.background} />
      <Box className={classes.appIconPositioning}>
        <Box className={classes.appIconContainer}>
          <Image
            className={classes.appIcon}
            src={world?.icon?.src ?? "/web-app-manifest-512x512.png"}
            {...(world?.icon?.srcset && { srcSet: world.icon.srcset })}
          />
          <LoadingOverlay visible={loading} />
        </Box>
      </Box>
      <Text className={classes.appLabel}>
        {world?.owner_name ?? "(your name)"}
      </Text>
      <Text className={classes.yourPageLabel}>{arrowLabel}</Text>
    </Box>
  );
};

export default WorldHomescreenPreview;
