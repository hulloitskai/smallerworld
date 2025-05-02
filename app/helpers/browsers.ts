import { type IResult, UAParser } from "ua-parser-js";

export const useBrowserDetection = (): IResult | undefined => {
  const [result, setResult] = useState<IResult | undefined>();
  useEffect(() => {
    setResult(detectBrowser());
  }, []);
  return result;
};

export const detectBrowser = (): IResult => {
  const parser = new UAParser();
  return parser.getResult();
};

export const isIos = (result: IResult): boolean => result.os.is("iOS");
export const isAndroid = (result: IResult): boolean => result.os.is("Android");

const canUseShortcutsExploit = (result: IResult): boolean =>
  isIos(result) &&
  !!result.os.version &&
  (result.os.version.startsWith("17") || result.os.version.startsWith("18.0"));

export const isMobileStandaloneBrowser = (result: IResult): boolean =>
  (isIos(result) || isAndroid(result)) && result.browser.type !== "inapp";

export const isDesktop = (result: IResult): boolean =>
  result.device.type !== "mobile" && result.device.type !== "tablet";

export const canOpenUrlInMobileSafari = (result: IResult): boolean =>
  isIos(result) &&
  (!result.browser.is("Instagram") || canUseShortcutsExploit(result));

export const openUrlInMobileSafari = (url: string): void => {
  const parser = new UAParser();
  const result = parser.getResult();
  const parsedUrl = hrefToUrl(url);
  if (result.browser.is("Instagram") && canUseShortcutsExploit(result)) {
    location.href = `shortcuts://x-callback-url/run-shortcut?name=${uuid()}&x-error=${encodeURIComponent(parsedUrl.toString())}`;
  } else if (parsedUrl.protocol === "https:") {
    location.href = `x-safari-${parsedUrl.toString()}`;
  }
};
