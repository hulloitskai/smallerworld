import {
  type IBrowser,
  type IDevice,
  type IOS,
  type IResult,
  UAParser,
} from "ua-parser-js";
import { v4 as uuid } from "uuid";

export const useBrowserDetection = (): IResult | undefined => {
  const [result, setResult] = useState<IResult | undefined>();
  useEffect(() => {
    const parser = new UAParser();
    setResult(parser.getResult());
  }, []);
  return result;
};

const isMobileSafari = (browser: IBrowser): boolean =>
  browser.is("Mobile Safari");

const isDesktop = (device: IDevice) =>
  device.type !== "mobile" && device.type !== "tablet";

const isInAppBrowser = (browser: IBrowser): boolean => browser.is("inapp");

const isIos = (os: IOS): boolean => os.is("iOS");

const canUseShortcutsExploit = (os: IOS): boolean =>
  isIos(os) &&
  !!os.version &&
  (os.version.startsWith("17") || os.version.startsWith("18.0"));

const canOpenUrlInMobileSafari = ({ browser, os }: IResult): boolean =>
  browser.is("Instagram") || canUseShortcutsExploit(os);

const isIosAndStuckInAppBrowser = (result: IResult): boolean =>
  isIos(result.os) &&
  isInAppBrowser(result.browser) &&
  !canOpenUrlInMobileSafari(result);

export const useIsIosAndStuckInAppBrowser = (
  result: IResult | undefined,
): boolean | undefined =>
  useMemo(() => {
    if (result) {
      return isIosAndStuckInAppBrowser(result);
    }
  }, [result]);

export const useIsMobileSafari = (
  result: IResult | undefined,
): boolean | undefined =>
  useMemo(() => {
    if (result) {
      return isMobileSafari(result.browser);
    }
  }, [result]);

export const useIsDesktop = (
  result: IResult | undefined,
): boolean | undefined =>
  useMemo(() => {
    if (result) {
      return isDesktop(result.device);
    }
  }, [result]);

export const openUrlInMobileSafari = (url: string) => {
  const parser = new UAParser();
  const result = parser.getResult();
  if (result.browser.name === "Instagram" && canUseShortcutsExploit(result)) {
    location.href = `shortcuts://x-callback-url/run-shortcut?name=${uuid()}&x-error=${encodeURIComponent(url)}`;
  } else if (url.startsWith("https://")) {
    location.href = `x-safari-${url}`;
  }
};
