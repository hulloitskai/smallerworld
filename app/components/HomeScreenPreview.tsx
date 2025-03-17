import { getRadius, Image, type MantineRadius, Text } from "@mantine/core";
import { type ReactNode } from "react";

import homeScreenSrc from "~/assets/images/home-screen.png";
import logoPlaceholderSrc from "~/assets/images/logo-placeholder.jpg";

import { APPLE_ICON_RADIUS_RATIO } from "~/helpers/app";
import { type Image as ImageModel } from "~/types";

import classes from "./HomeScreenPreview.module.css";

export interface HomeScreenPreviewProps extends BoxProps {
  userName: string;
  pageIcon: ImageModel | null;
  arrowLabel: ReactNode;
  radius?: MantineRadius;
}

const HomeScreenPreview: FC<HomeScreenPreviewProps> = ({
  userName,
  pageIcon,
  arrowLabel,
  radius,
  ...otherProps
}) => {
  useEffect(() => {
    // @ts-expect-error Fontsource is not typed
    void import("@fontsource/single-day");
  }, []);

  return (
    <Box
      className={cn("HomescreenPreview", classes.container)}
      pos="relative"
      w={300}
      style={{
        "--hp-radius": getRadius(radius),
        "--hp-icon-radius-ratio": APPLE_ICON_RADIUS_RATIO,
      }}
      {...otherProps}
    >
      <Image src={homeScreenSrc} />
      <Image
        src={pageIcon?.src ?? logoPlaceholderSrc}
        srcSet={pageIcon?.src_set}
        className={classes.appIcon}
      />
      <Text className={classes.appLabel}>{userName || "(your name)"}</Text>
      <Text className={classes.yourPageLabel}>{arrowLabel}</Text>
    </Box>
  );
};

export default HomeScreenPreview;
