import { isIosSafari as _isIosSafari } from "@braintree/browser-detection";

export const isIosSafari = (): boolean => {
  const url = new URL(location.href);
  const emulateMobileSafari =
    url.searchParams.get("emulate_mobile_safari") ?? "";
  if (["yes", "1", "true"].includes(emulateMobileSafari.toLowerCase())) {
    return true;
  }
  return _isIosSafari();
};
