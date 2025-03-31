import { Text } from "@mantine/core";

import {
  canOpenUrlInMobileSafari,
  isAndroid,
  isDesktop,
  isIos,
  isMobileStandaloneBrowser,
  useBrowserDetection,
} from "~/helpers/browsers";

import classes from "./BrowserNotSupportedText.module.css";

const BrowserNotSupportedText: FC = () => {
  const browserDetection = useBrowserDetection();
  if (!browserDetection) {
    return null;
  }
  if (
    isIos(browserDetection) &&
    !isMobileStandaloneBrowser(browserDetection) &&
    !canOpenUrlInMobileSafari(browserDetection)
  ) {
    return <Text className={classes.text}>open in Safari to continue</Text>;
  }
  if (
    isAndroid(browserDetection) &&
    !isMobileStandaloneBrowser(browserDetection)
  ) {
    return (
      <Text className={classes.text}>open in your browser to continue</Text>
    );
  }
  if (isDesktop(browserDetection)) {
    return <Text className={classes.text}>open on your phone to continue</Text>;
  }
  return null;
};

export default BrowserNotSupportedText;
