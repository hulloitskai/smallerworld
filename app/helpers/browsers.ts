import { type IBrowser, type IOS, type IResult, UAParser } from "ua-parser-js";
import { v4 as uuid } from "uuid";

export const useBrowserDetection = (): IResult | undefined => {
  const [result, setResult] = useState<IResult | undefined>();
  useEffect(() => {
    const parser = new UAParser();
    setResult(parser.getResult());
  }, []);
  return result;
};

export const isMobileSafari = (browser: IBrowser): boolean =>
  browser.name === "Mobile Safari";

// export const isDesktopSafari = (browser: IBrowser): boolean =>
//   browser.name === "Safari";

const isInAppBrowser = (browser: IBrowser): boolean => browser.type === "inapp";

const isIos = (os: IOS): boolean => os.name === "iOS";

const canUseShortcutsExploit = (os: IOS): boolean =>
  isIos(os) &&
  !!os.version &&
  (os.version.startsWith("17") || os.version.startsWith("18.0"));

const canOpenUrlInMobileSafari = ({ browser, os }: IResult): boolean =>
  browser.name !== "Instagram" || canUseShortcutsExploit(os);

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

export const openUrlInMobileSafari = (url: string) => {
  const parser = new UAParser();
  const result = parser.getResult();
  if (result.browser.name === "Instagram" && canUseShortcutsExploit(result)) {
    location.href = `shortcuts://x-callback-url/run-shortcut?name=${uuid()}&x-error=${encodeURIComponent(url)}`;
  } else if (url.startsWith("https://")) {
    location.href = `x-safari-${url}`;
  }
};
