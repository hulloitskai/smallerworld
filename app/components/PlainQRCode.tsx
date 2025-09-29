import QRCode, { type QRCodeProps } from "react-qr-code";

import classes from "./PlainQRCode.module.css";

export interface PlainQRCodeProps extends Omit<QRCodeProps, "ref"> {}

const PlainQRCode: FC<PlainQRCodeProps> = ({
  className,
  size = 160,
  ...otherProps
}) => (
  <QRCode
    className={cn("PlainQRCode", classes.qrCode, className)}
    {...{ size }}
    {...otherProps}
  />
);

export default PlainQRCode;
