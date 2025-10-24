import { type QRCodeProps } from "react-qr-code";

import { shortlinkIfAvailable } from "~/helpers/shortlinks";

import PlainQRCode from "./PlainQRCode";

export interface CurrentUrlQRCodeProps extends Omit<QRCodeProps, "value"> {
  queryParams?: Record<string, string>;
}

const CurrentUrlQRCode: FC<CurrentUrlQRCodeProps> = ({
  queryParams,
  ...otherProps
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>();
  useEffect(() => {
    const currentUrl = hrefToUrl(location.href);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        currentUrl.searchParams.set(key, value);
      });
    }
    shortlinkIfAvailable(currentUrl);
    setCurrentUrl(currentUrl.toString());
  }, [queryParams]);
  return (
    <>{!!currentUrl && <PlainQRCode value={currentUrl} {...otherProps} />}</>
  );
};

export default CurrentUrlQRCode;
