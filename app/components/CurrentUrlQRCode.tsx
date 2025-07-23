import { type QRCodeProps } from "react-qr-code";

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
    const url = hrefToUrl(location.href);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    setCurrentUrl(url.toString());
  }, [queryParams]);
  return (
    <>{!!currentUrl && <PlainQRCode value={currentUrl} {...otherProps} />}</>
  );
};

export default CurrentUrlQRCode;
