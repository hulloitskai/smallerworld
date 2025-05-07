import { getRadius, Image, type MantineRadius, Text } from "@mantine/core";
import { type ReactNode } from "react";

import homeScreenSrc from "~/assets/images/home-screen.png";

import { USER_ICON_RADIUS_RATIO } from "~/helpers/userPages";

import SingleDayFontHead from "./SingleDayFontHead";

import classes from "./HomeScreenPreview.module.css";

export interface HomeScreenPreviewProps extends BoxProps {
  pageName: string;
  pageIcon: { src: string; srcset?: string | null } | null;
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
      <SingleDayFontHead />
      <Box
        className={cn("HomescreenPreview", classes.container)}
        pos="relative"
        style={{
          "--hp-radius": getRadius(radius),
          "--hp-icon-radius-ratio": USER_ICON_RADIUS_RATIO,
        }}
        {...otherProps}
      >
        <Image src={homeScreenSrc} className={classes.homeScreen} />
        <Image
          src={pageIcon?.src ?? "/web-app-manifest-512x512.png"}
          srcSet={pageIcon?.srcset ?? undefined}
          className={classes.appIcon}
        />
        <Text className={classes.appLabel}>{pageName || "(your name)"}</Text>
        <Text className={classes.yourPageLabel}>{arrowLabel}</Text>
      </Box>
    </>
  );
};

export default HomeScreenPreview;
