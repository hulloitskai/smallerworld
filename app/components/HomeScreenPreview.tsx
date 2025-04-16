import { getRadius, Image, type MantineRadius, Text } from "@mantine/core";
import { type ReactNode } from "react";

import homeScreenSrc from "~/assets/images/home-screen.png";

import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";

import SingleDayFontMeta from "./SingleDayFontMeta";

import classes from "./HomeScreenPreview.module.css";

export interface HomeScreenPreviewProps extends BoxProps {
  pageName: string;
  pageIcon: { src: string; src_set?: string } | null;
  arrowLabel: ReactNode;
  radius?: MantineRadius;
}

const HomeScreenPreview: FC<HomeScreenPreviewProps> = ({
  pageName,
  pageIcon,
  arrowLabel,
  radius,
  ...otherProps
}) => {
  return (
    <>
      <SingleDayFontMeta />
      <Box
        className={cn("HomescreenPreview", classes.container)}
        pos="relative"
        style={{
          "--hp-radius": getRadius(radius),
          "--hp-icon-radius-ratio": APPLE_ICON_RADIUS_RATIO,
        }}
        {...otherProps}
      >
        <Image src={homeScreenSrc} className={classes.homeScreen} />
        <Image
          src={pageIcon?.src ?? "/web-app-manifest-512x512.png"}
          srcSet={pageIcon?.src_set}
          className={classes.appIcon}
        />
        <Text className={classes.appLabel}>{pageName || "(your name)"}</Text>
        <Text className={classes.yourPageLabel}>{arrowLabel}</Text>
      </Box>
    </>
  );
};

export default HomeScreenPreview;
