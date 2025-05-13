import { Settings } from "luxon";

declare module "luxon" {
  interface TSSettings {
    throwOnInvalid: true;
  }
}

export const setupLuxon = (): void => {
  Settings.defaultLocale = "en-US";
  Settings.throwOnInvalid = true;
};
