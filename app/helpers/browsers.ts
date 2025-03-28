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

export const isIos = (os: IOS): boolean => !!os && os.is("iOS");
export const isAndroid = (os: IOS): boolean => !!os && os.is("Android");

const canUseShortcutsExploit = (os: IOS): boolean =>
  isIos(os) &&
  !!os.version &&
  (os.version.startsWith("17") || os.version.startsWith("18.0"));

export const isMobileSafari = (browser: IBrowser): boolean =>
  browser.is("Mobile Safari");

export const isDesktop = (device: IDevice): boolean =>
  device.type !== "mobile" && device.type !== "tablet";

export const isInAppBrowser = (browser: IBrowser): boolean =>
  browser.is("inapp");

export const canOpenUrlInMobileSafari = (result: IResult): boolean =>
  isIos(result.os) &&
  (!result.browser.is("Instagram") || canUseShortcutsExploit(result.os));

export const openUrlInMobileSafari = (url: string) => {
  const parser = new UAParser();
  const result = parser.getResult();
  if (result.browser.name === "Instagram" && canUseShortcutsExploit(result)) {
    location.href = `shortcuts://x-callback-url/run-shortcut?name=${uuid()}&x-error=${encodeURIComponent(url)}`;
  } else if (url.startsWith("https://")) {
    location.href = `x-safari-${url}`;
  }
};
