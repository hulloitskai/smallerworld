import { type QRCodeProps } from "react-qr-code";

import PlainQRCode from "./PlainQRCode";

export interface CurrentUrlQRCodeProps extends Omit<QRCodeProps, "value"> {
  query?: Record<string, string>;
}

const CurrentUrlQRCode: FC<CurrentUrlQRCodeProps> = ({
  query,
  ...otherProps
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>();
  useEffect(() => {
    const url = new URL(location.href);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    setCurrentUrl(url.toString());
  }, [query]);
  return (
    <>{!!currentUrl && <PlainQRCode value={currentUrl} {...otherProps} />}</>
  );
};

export default CurrentUrlQRCode;
